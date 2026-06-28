from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Literal

from pydantic import BaseModel, Field, ConfigDict


# ---------- Checkout step 1: Shipping & billing ----------

class CheckoutShippingBillingRequest(BaseModel):
    address_id: int
    payment_type: Literal["invoice_me", "credit_card"]
    credit_card_id: Optional[int] = None


class CheckoutShippingBillingOut(BaseModel):
    """What the cart page's Shipping & Billing step renders: address options + cart contents + summary."""
    available_addresses: list
    selected_address_id: Optional[int]
    payment_type: Optional[str]
    selected_credit_card_id: Optional[int]
    cart: "CartSummaryForCheckout"


class CartSummaryForCheckout(BaseModel):
    items: list
    subtotal: Decimal
    tax_amount: Decimal
    shipping_amount: Decimal
    total_amount: Decimal


# ---------- Checkout step 2: Order review ----------

class OrderReviewOut(BaseModel):
    address: dict
    payment_type: str
    items: list
    subtotal: Decimal
    tax_amount: Decimal
    shipping_amount: Decimal
    total_amount: Decimal


# ---------- Checkout step 3: Place order / confirmation ----------

class PlaceOrderRequest(BaseModel):
    address_id: int
    payment_type: Literal["invoice_me", "credit_card"]
    credit_card_id: Optional[int] = None


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_id: int
    product_name_snapshot: str
    sku_snapshot: str
    unit_price: Decimal
    quantity: int
    line_total: Decimal


class OrderConfirmationOut(BaseModel):
    """
    Shown on the Order Confirmation page.
    Displays BOTH the Local Order ID and the SAP Sales Order Number per the
    integration requirement. sap_sales_order_number may be null briefly if
    SAP sync is still in-flight/async — frontend can poll order status.
    """
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    status: str
    sap_sales_order_number: Optional[str] = None
    sap_sync_status: Literal["pending", "synced", "failed"]
    items: List[OrderItemOut]
    subtotal: Decimal
    tax_amount: Decimal
    shipping_amount: Decimal
    total_amount: Decimal
    created_at: datetime


class OrderTileOut(BaseModel):
    """Order history tile."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    status: str
    sap_sales_order_number: Optional[str] = None
    total_amount: Decimal
    created_at: datetime
    is_favourite: bool = False
    item_count: int


class OrderHistoryResponse(BaseModel):
    items: List[OrderTileOut]
    total: int
    page: int
    page_size: int


class OrderDetailOut(OrderConfirmationOut):
    tracking_status: Optional[str] = None
    tracking_number: Optional[str] = None


class TrackOrderTileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    tracking_status: Optional[str] = None
    tracking_number: Optional[str] = None
    sap_sales_order_number: Optional[str] = None
    created_at: datetime


class ReorderResponse(BaseModel):
    message: str
    cart_item_count: int
