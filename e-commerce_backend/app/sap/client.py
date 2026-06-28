"""
SAP S/4HANA RAP OData V4 client.

Responsibilities:
 1. Fetch stock availability for products (GET) — used by the product service
    to refresh `is_in_stock` on the Product table (PLP "OutOfStock" disabling).
 2. Create a Sales Order in SAP after a local order is saved in MySQL (POST).

Design notes:
 - OData V4 write operations (POST/PATCH/DELETE) require an X-CSRF-Token
   fetched via a preliminary GET with header `X-CSRF-Token: Fetch`. Some RAP
   services (esp. those exposed as pure V4 "draft-less" services) don't need
   this, but we fetch it defensively since it's a no-op cost on services that
   don't require it.
 - Retries use exponential backoff via `tenacity`, and only retry on
   transient errors (timeouts, 5xx, connection errors) — never on 4xx, since
   those indicate a bad payload that retrying won't fix.
 - All calls are logged to logs/sap_integration.log (see core/logging_config.py).
"""
from decimal import Decimal
from typing import Optional

import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)
import logging

from app.core.config import settings
from app.core.logging_config import logger
from app.sap.auth import sap_auth_manager


class SapServiceError(Exception):
    """Raised for SAP errors that should NOT be retried (validation/4xx)."""
    def __init__(self, message: str, status_code: Optional[int] = None, sap_error_body: Optional[dict] = None):
        super().__init__(message)
        self.status_code = status_code
        self.sap_error_body = sap_error_body


class SapTransientError(Exception):
    """Raised for SAP errors that SHOULD be retried (timeouts, 5xx, network)."""
    pass


RETRYABLE_EXCEPTIONS = (
    SapTransientError,
    httpx.TimeoutException,
    httpx.ConnectError,
    httpx.ReadTimeout,
)


class SapClient:
    def __init__(self):
        self.base_url = settings.SAP_BASE_URL.rstrip("/")
        self.service_path = settings.SAP_ODATA_SERVICE_PATH.rstrip("/")
        self.timeout = settings.SAP_REQUEST_TIMEOUT_SECONDS

    @property
    def service_url(self) -> str:
        return f"{self.base_url}{self.service_path}"

    def _fetch_csrf_token(self, client: httpx.Client, headers: dict) -> Optional[str]:
        try:
            resp = client.get(
                f"{self.service_url}/",
                headers={**headers, "X-CSRF-Token": "Fetch"},
                timeout=self.timeout,
            )
            token = resp.headers.get("X-CSRF-Token")
            if token:
                logger.debug("sap.csrf | Token acquired successfully")
            return token
        except httpx.HTTPError as exc:
            logger.warning("sap.csrf | Could not fetch CSRF token, proceeding without it: {}", exc)
            return None

    def _raise_for_sap_response(self, response: httpx.Response):
        """Classify SAP's response into retryable vs non-retryable errors."""
        if response.status_code in (500, 502, 503, 504):
            raise SapTransientError(f"SAP returned transient status {response.status_code}: {response.text[:500]}")
        if response.status_code == 401:
            sap_auth_manager.invalidate()
            raise SapTransientError("SAP returned 401 — token invalidated, will retry with fresh token")
        if response.status_code >= 400:
            try:
                error_body = response.json()
            except ValueError:
                error_body = {"raw": response.text[:500]}
            raise SapServiceError(
                f"SAP returned non-retryable error {response.status_code}",
                status_code=response.status_code,
                sap_error_body=error_body,
            )

    @retry(
        retry=retry_if_exception_type(RETRYABLE_EXCEPTIONS),
        stop=stop_after_attempt(settings.SAP_MAX_RETRIES),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True,
    )
    def get_stock_for_materials(self, material_numbers: list[str]) -> dict[str, dict]:
        """
        GET stock availability for a batch of SKUs (SAP Material Numbers).
        Returns: { material_number: {"quantity": int, "is_in_stock": bool} }

        Real RAP entity example: ZUI_MATERIAL_STOCK with $filter on MaterialNumber.
        """
        headers = {"Accept": "application/json", **sap_auth_manager.get_auth_header()}
        filter_clause = " or ".join(f"MaterialNumber eq '{m}'" for m in material_numbers)

        with httpx.Client() as client:
            try:
                response = client.get(
                    f"{self.service_url}/ZC_MATERIALSTOCK",
                    headers=headers,
                    params={"$filter": filter_clause, "$select": "MaterialNumber,AvailableQuantity"},
                    timeout=self.timeout,
                )
            except (httpx.TimeoutException, httpx.ConnectError) as exc:
                logger.error("sap.stock | Network error calling SAP stock API: {}", exc)
                raise SapTransientError(str(exc)) from exc

            self._raise_for_sap_response(response)

            data = response.json()
            results = {}
            for entry in data.get("value", []):
                material = entry["MaterialNumber"]
                qty = int(entry.get("AvailableQuantity", 0))
                results[material] = {"quantity": qty, "is_in_stock": qty > 0}

            logger.info("sap.stock | Fetched stock for {} materials", len(results))
            return results

    @retry(
        retry=retry_if_exception_type(RETRYABLE_EXCEPTIONS),
        stop=stop_after_attempt(settings.SAP_MAX_RETRIES),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True,
    )
    def create_sales_order(
        self,
        local_order_number: str,
        customer_id: str,
        items: list[dict],
        shipping_address: dict,
    ) -> dict:
        """
        POST a new Sales Order to SAP RAP service (ZUI_SALES_ORDER).
        `items`: [{"material_number": str, "quantity": int, "unit_price": Decimal}, ...]

        Returns: {"sap_sales_order_number": str, "raw_response": dict}

        Raises SapServiceError for validation failures (4xx — do not retry).
        Raises SapTransientError (auto-retried by @retry) for 5xx/timeouts.
        """
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            **sap_auth_manager.get_auth_header(),
        }

        with httpx.Client() as client:
            csrf_token = self._fetch_csrf_token(client, headers)
            if csrf_token:
                headers["X-CSRF-Token"] = csrf_token

            payload = {
                "SalesOrderType": "OR",
                "SoldToParty": customer_id,
                "PurchaseOrderByCustomer": local_order_number,  # ties SAP order back to local order
                "to_Item": [
                    {
                        "Material": item["material_number"],
                        "RequestedQuantity": str(item["quantity"]),
                        "NetPriceAmount": str(item["unit_price"]),
                    }
                    for item in items
                ],
                "to_PartnerShipTo": {
                    "AddressName": shipping_address.get("full_name"),
                    "StreetName": shipping_address.get("line1"),
                    "CityName": shipping_address.get("city"),
                    "Region": shipping_address.get("state"),
                    "PostalCode": shipping_address.get("postal_code"),
                    "Country": shipping_address.get("country"),
                },
            }

            try:
                response = client.post(
                    f"{self.service_url}/SalesOrder",
                    headers=headers,
                    json=payload,
                    timeout=self.timeout,
                )
            except (httpx.TimeoutException, httpx.ConnectError) as exc:
                logger.error("sap.sales_order | Network error creating SAP sales order: {}", exc)
                raise SapTransientError(str(exc)) from exc

            self._raise_for_sap_response(response)

            data = response.json()
            sap_order_number = data.get("SalesOrder")
            logger.info(
                "sap.sales_order | Created SAP Sales Order {} for local order {}",
                sap_order_number,
                local_order_number,
            )
            return {"sap_sales_order_number": sap_order_number, "raw_response": data}


sap_client = SapClient()
