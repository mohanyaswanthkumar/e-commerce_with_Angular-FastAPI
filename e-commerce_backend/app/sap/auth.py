"""
Handles OAuth2 client-credentials token acquisition for calling SAP S/4HANA
RAP OData services. Tokens are cached in-memory and refreshed automatically
before expiry. For SAP Basic Auth deployments, see `get_basic_auth_header`.
"""
import base64
import time
from threading import Lock
from typing import Optional

import httpx

from app.core.config import settings
from app.core.logging_config import logger


class SapAuthManager:
    def __init__(self):
        self._access_token: Optional[str] = None
        self._expires_at: float = 0.0
        self._lock = Lock()

    def get_basic_auth_header(self) -> dict:
        credentials = f"{settings.SAP_BASIC_USER}:{settings.SAP_BASIC_PASSWORD}"
        encoded = base64.b64encode(credentials.encode()).decode()
        return {"Authorization": f"Basic {encoded}"}

    def _fetch_new_token(self) -> str:
        logger.info("sap.auth | Requesting new OAuth2 token from SAP token endpoint")
        response = httpx.post(
            settings.SAP_OAUTH_TOKEN_URL,
            data={
                "grant_type": "client_credentials",
                "client_id": settings.SAP_OAUTH_CLIENT_ID,
                "client_secret": settings.SAP_OAUTH_CLIENT_SECRET,
                "scope": settings.SAP_OAUTH_SCOPE,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=settings.SAP_REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        payload = response.json()
        token = payload["access_token"]
        # Refresh 60s before actual expiry to avoid races with in-flight requests
        expires_in = int(payload.get("expires_in", 3600))
        self._expires_at = time.time() + max(expires_in - 60, 30)
        logger.info("sap.auth | New OAuth2 token acquired, expires_in={}s", expires_in)
        return token

    def get_token(self) -> str:
        with self._lock:
            if self._access_token is None or time.time() >= self._expires_at:
                self._access_token = self._fetch_new_token()
            return self._access_token

    def invalidate(self):
        """Call this if a request fails with 401 — forces a fresh token on next call."""
        with self._lock:
            self._access_token = None
            self._expires_at = 0.0

    def get_auth_header(self) -> dict:
        if settings.SAP_AUTH_TYPE == "basic":
            return self.get_basic_auth_header()
        token = self.get_token()
        return {"Authorization": f"Bearer {token}"}


sap_auth_manager = SapAuthManager()
