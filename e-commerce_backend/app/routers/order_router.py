"""
/api/v1/orders/* and /api/v1/checkout/*

Checkout is split into the 3 cart-page sections from the spec:
  1. GET  /checkout/shipping-billing   -> addresses + payment pref + cart contents
  2. POST /checkout/review             -> validates selection, returns review summary
  3. POST /checkout/place-order        -> creates the order, syncs to SAP, returns confirmation

Order history / tracking / reorder / favourites live under /orders/*.
"""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_current_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.address import AddressOut
from app.schemas.order import (
    CheckoutShippingBillingOut, CartSummaryForCheckout, OrderReviewOut,
    PlaceOrderRequest, OrderConfirmationOut, OrderItemOut,
    OrderHistoryResponse, OrderTileOut, OrderDetailOut, TrackOrderTileOut, ReorderResponse,
)
from app.services import cart_service, address_service, payment_service, order_service

router = APIRouter(tags=["Orders & Checkout"])


def _order_items_out(order) -> list:
    return [
        OrderItemOut(
            product_id=i.product_id, product_name_snapshot=i.product_name_snapshot,
            sku_snapshot=i.sku_snapshot, unit_price=i.unit_price, quantity=i.quantity, line_total=i.line_total,
        )
        for i in order.items
    ]


def _confirmation_out(order) -> OrderConfirmationOut:
    return OrderConfirmationOut(
        id=order.id, order_number=order.order_number, status=order.status,
        sap_sales_order_number=order.sap_sales_order_number, sap_sync_status=order.sap_sync_status,
        items=_order_items_out(order), subtotal=order.subtotal, tax_amount=order.tax_amount,
        shipping_amount=order.shipping_amount, total_amount=order.total_amount, created_at=order.created_at,
    )


# ---------------- Checkout: Step 1 - Shipping & Billing ----------------

@router.get("/checkout/shipping-billing", response_model=CheckoutShippingBillingOut)
def get_shipping_billing_step(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    addresses = address_service.list_addresses(db, current_user)
    pref = payment_service.get_payment_preference(db, current_user)
    cart = cart_service.get_cart_with_items(db, current_user)
    totals = cart_service.calculate_totals(cart)

    default_address = next((a for a in addresses if a.is_default), addresses[0] if addresses else None)

    cart_items = [
        {
            "product_id": i.product_id, "product_name": i.product.name,
            "product_image_url": i.product.image_url, "unit_price": float(i.product.price),
            "quantity": i.quantity, "line_total": float(i.product.price * i.quantity),
        }
        for i in cart.items
    ]

    return CheckoutShippingBillingOut(
        available_addresses=[AddressOut.model_validate(a).model_dump() for a in addresses],
        selected_address_id=default_address.id if default_address else None,
        payment_type=pref.preference_type if pref else None,
        selected_credit_card_id=pref.default_credit_card_id if pref else None,
        cart=CartSummaryForCheckout(items=cart_items, **totals),
    )


# ---------------- Checkout: Step 2 - Order Review ----------------

@router.post("/checkout/review", response_model=OrderReviewOut)
def get_order_review_step(
    payload: PlaceOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    address = address_service.get_address_or_404(db, current_user, payload.address_id)
    cart = cart_service.get_cart_with_items(db, current_user)
    totals = cart_service.calculate_totals(cart)

    items = [
        {
            "product_id": i.product_id, "product_name": i.product.name,
            "unit_price": float(i.product.price), "quantity": i.quantity,
            "line_total": float(i.product.price * i.quantity),
        }
        for i in cart.items
    ]

    return OrderReviewOut(
        address=AddressOut.model_validate(address).model_dump(),
        payment_type=payload.payment_type,
        items=items,
        **totals,
    )


# ---------------- Checkout: Step 3 - Place Order / Confirmation ----------------

@router.post("/checkout/place-order", response_model=OrderConfirmationOut, status_code=201)
def place_order(
    payload: PlaceOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = order_service.place_order(db, current_user, payload)
    return _confirmation_out(order)


@router.get("/orders/{order_id}/confirmation", response_model=OrderConfirmationOut)
def get_order_confirmation(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lets the frontend poll for the SAP sync result if it was 'pending' right after placement."""
    order = order_service.get_order_or_404(db, current_user, order_id)
    return _confirmation_out(order)


# ---------------- Order History ----------------

@router.get("/orders", response_model=OrderHistoryResponse)
def get_order_history(
    order_status: Optional[str] = Query(None, alias="status", description="in_progress|on_hold|completed|refunded"),
    favourites_only: bool = Query(False),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    orders, total, favourite_ids = order_service.list_order_history(
        db, current_user, order_status, favourites_only, page, page_size
    )
    tiles = [
        OrderTileOut(
            id=o.id, order_number=o.order_number, status=o.status,
            sap_sales_order_number=o.sap_sales_order_number, total_amount=o.total_amount,
            created_at=o.created_at, is_favourite=o.id in favourite_ids, item_count=len(o.items),
        )
        for o in orders
    ]
    return OrderHistoryResponse(items=tiles, total=total, page=page, page_size=page_size)


@router.get("/orders/{order_id}", response_model=OrderDetailOut)
def get_order_details(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = order_service.get_order_or_404(db, current_user, order_id)
    base = _confirmation_out(order).model_dump()
    return OrderDetailOut(**base, tracking_status=order.tracking_status, tracking_number=order.tracking_number)


@router.post("/orders/{order_id}/favourite", status_code=200)
def toggle_favourite(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    is_favourite = order_service.toggle_favourite_order(db, current_user, order_id)
    return {"order_id": order_id, "is_favourite": is_favourite}


@router.post("/orders/{order_id}/reorder", response_model=ReorderResponse)
def reorder(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    added = order_service.reorder(db, current_user, order_id)
    return ReorderResponse(message=f"{added} item(s) added to your cart.", cart_item_count=added)


# ---------------- Track My Order ----------------

@router.get("/orders/tracking/all", response_model=list[TrackOrderTileOut])
def track_my_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return order_service.list_tracking(db, current_user)


# ---------------- Admin: manual SAP retry for stuck orders ----------------

@router.post("/orders/{order_id}/sap-retry", response_model=OrderConfirmationOut)
def retry_sap_sync(
    order_id: int,
    _admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    order = order_service.retry_sap_sync(db, order_id)
    return _confirmation_out(order)
