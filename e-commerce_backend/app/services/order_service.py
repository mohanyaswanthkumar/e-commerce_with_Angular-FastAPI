"""
Order placement and SAP RAP integration.

Flow (matches the requested scenario exactly):
  1. Angular sends order (address_id, payment_type, credit_card_id) to backend.
  2. Backend validates data (address ownership, card ownership, stock, cart not empty).
  3. Backend saves the order + order_items into MySQL inside a DB transaction.
  4. AFTER successful commit, backend calls SAP RAP OData to create a Sales Order.
  5. SAP creates the Sales Order; supplier sees it inside SAP.
  6. Backend stores `sap_sales_order_number` + `sap_sync_status` back onto the
     same Order row in MySQL.
  7. Angular displays both the Local Order ID (order_number) and the SAP
     Sales Order Number on the confirmation page.

Design choice — synchronous-with-fallback:
  We attempt the SAP call synchronously right after the local commit so the
  confirmation page can show the SAP number immediately in the common case.
  If SAP is slow/unavailable, we DO NOT fail the checkout (the customer's
  order is already safely committed) — instead we mark sap_sync_status="failed"
  /"pending" and publish a Kafka event (`order.placed`) that a background
  retry worker / separate SAP-integration microservice consumes to keep
  retrying independently of the request/response cycle. This decouples "did
  the customer's order succeed" from "did SAP accept it yet".
"""
import random
import string
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.order import Order, OrderItem, FavouriteOrder
from app.models.address import Address
from app.models.payment import CreditCard
from app.models.user import User
from app.schemas.order import PlaceOrderRequest
from app.services import cart_service
from app.services.address_service import get_address_or_404
from app.services.payment_service import get_card_or_404
from app.core.logging_config import logger
from app.core.config import settings
from app.kafka.producer import kafka_producer
from app.sap.client import sap_client, SapServiceError, SapTransientError


def _generate_order_number() -> str:
    year = datetime.now(timezone.utc).year
    suffix = "".join(random.choices(string.digits, k=6))
    return f"ORD-{year}-{suffix}"


def _validate_checkout_inputs(db: Session, user: User, payload: PlaceOrderRequest) -> tuple[Address, CreditCard | None]:
    address = get_address_or_404(db, user, payload.address_id)

    credit_card = None
    if payload.payment_type == "credit_card":
        if payload.credit_card_id is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="credit_card_id is required for credit_card payment")
        credit_card = get_card_or_404(db, user, payload.credit_card_id)
        if credit_card.status == "expired":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected credit card has expired")

    return address, credit_card


def place_order(db: Session, user: User, payload: PlaceOrderRequest) -> Order:
    cart = cart_service.get_cart_with_items(db, user)
    if not cart.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    # Re-validate stock at checkout time (it may have changed since the item was added)
    out_of_stock_items = [item.product.name for item in cart.items if not item.product.is_in_stock]
    if out_of_stock_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The following items are out of stock: {', '.join(out_of_stock_items)}",
        )

    address, credit_card = _validate_checkout_inputs(db, user, payload)
    totals = cart_service.calculate_totals(cart)

    # ---- Step 3: Save order + items into MySQL inside one transaction ----
    order = Order(
        order_number=_generate_order_number(),
        user_id=user.id,
        shipping_address_id=address.id,
        payment_type=payload.payment_type,
        credit_card_id=credit_card.id if credit_card else None,
        subtotal=totals["subtotal"],
        tax_amount=totals["tax_amount"],
        shipping_amount=totals["shipping_amount"],
        total_amount=totals["total_amount"],
        status="in_progress",
        sap_sync_status="pending",
    )
    db.add(order)
    db.flush()  # need order.id for order_items

    for item in cart.items:
        db.add(OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            product_name_snapshot=item.product.name,
            sku_snapshot=item.product.sku,
            unit_price=item.product.price,
            quantity=item.quantity,
            line_total=item.product.price * item.quantity,
        ))

    db.commit()
    db.refresh(order)
    logger.info("order.place | Order {} (id={}) saved to MySQL for user_id={}", order.order_number, order.id, user.id)

    # Clear the cart now that the order is durably saved
    cart_service.clear_cart(db, user)

    # ---- Step 4-6: Push to SAP RAP, store SAP Sales Order Number ----
    _sync_order_to_sap(db, order, address)

    # Publish event regardless of SAP sync outcome — lets other services
    # (notifications, analytics, a dedicated SAP-retry worker) react.
    kafka_producer.publish(
        topic=settings.KAFKA_TOPIC_ORDER_PLACED,
        key=order.order_number,
        value={
            "order_id": order.id,
            "order_number": order.order_number,
            "user_id": user.id,
            "total_amount": str(order.total_amount),
            "sap_sync_status": order.sap_sync_status,
        },
    )

    return order


def _sync_order_to_sap(db: Session, order: Order, address: Address) -> None:
    """Calls SAP RAP OData to create the Sales Order; updates the Order row with the result."""
    items_payload = [
        {
            "material_number": item.sku_snapshot,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
        }
        for item in order.items
    ]
    address_payload = {
        "full_name": address.full_name,
        "line1": address.line1,
        "city": address.city,
        "state": address.state,
        "postal_code": address.postal_code,
        "country": address.country,
    }

    order.sap_sync_attempts += 1

    try:
        result = sap_client.create_sales_order(
            local_order_number=order.order_number,
            customer_id=str(order.user_id),  # in production: map to the SAP Business Partner / Sold-To ID
            items=items_payload,
            shipping_address=address_payload,
        )
        order.sap_sales_order_number = result["sap_sales_order_number"]
        order.sap_sync_status = "synced"
        order.sap_sync_error = None
        order.sap_last_synced_at = datetime.now(timezone.utc)
        logger.info("order.sap_sync | Order {} synced to SAP as {}", order.order_number, order.sap_sales_order_number)

    except SapServiceError as exc:
        # Non-retryable (bad payload, validation error on SAP side). Needs a human/dev to fix and resubmit.
        order.sap_sync_status = "failed"
        order.sap_sync_error = f"{exc} | details={exc.sap_error_body}"
        logger.error("order.sap_sync | Order {} REJECTED by SAP (non-retryable): {}", order.order_number, exc)

    except SapTransientError as exc:
        # Retries already exhausted at the SapClient level (tenacity). Mark pending for the
        # background retry worker / dead-letter flow to pick up later — do not fail the order.
        order.sap_sync_status = "pending"
        order.sap_sync_error = str(exc)
        logger.error(
            "order.sap_sync | Order {} could not reach SAP after retries, queued for later retry: {}",
            order.order_number, exc,
        )

    db.commit()


def retry_sap_sync(db: Session, order_id: int) -> Order:
    """Called by an admin action or a scheduled retry worker for orders stuck in pending/failed."""
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.sap_sync_status == "synced":
        return order

    address = db.query(Address).filter(Address.id == order.shipping_address_id).first()
    _sync_order_to_sap(db, order, address)
    db.refresh(order)
    return order


def get_order_or_404(db: Session, user: User, order_id: int) -> Order:
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id, Order.user_id == user.id)
        .first()
    )
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


def list_order_history(
    db: Session, user: User, status_filter: str | None, favourites_only: bool, page: int, page_size: int
) -> tuple[list[Order], int, set[int]]:
    query = db.query(Order).filter(Order.user_id == user.id)
    if status_filter:
        query = query.filter(Order.status == status_filter)

    favourite_ids = {row[0] for row in db.query(FavouriteOrder.order_id).filter(FavouriteOrder.user_id == user.id).all()}

    if favourites_only:
        query = query.filter(Order.id.in_(favourite_ids))

    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return orders, total, favourite_ids


def toggle_favourite_order(db: Session, user: User, order_id: int) -> bool:
    get_order_or_404(db, user, order_id)  # ownership check

    existing = db.query(FavouriteOrder).filter(FavouriteOrder.user_id == user.id, FavouriteOrder.order_id == order_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return False

    db.add(FavouriteOrder(user_id=user.id, order_id=order_id))
    db.commit()
    return True


def reorder(db: Session, user: User, order_id: int) -> int:
    """Adds all items from a past order back into the user's current cart."""
    order = get_order_or_404(db, user, order_id)

    added = 0
    for item in order.items:
        try:
            cart_service.add_to_cart(db, user, item.product_id, item.quantity)
            added += 1
        except HTTPException as exc:
            # Product may since be discontinued/out-of-stock — skip it but keep processing the rest
            logger.warning("order.reorder | Skipped product_id={} for reorder: {}", item.product_id, exc.detail)
            continue

    logger.info("order.reorder | user_id={} reordered order_id={} -> {} items added", user.id, order_id, added)
    return added


def list_tracking(db: Session, user: User) -> list[Order]:
    return db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()
