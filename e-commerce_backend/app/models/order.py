from sqlalchemy import (
    Column, Integer, String, Numeric, ForeignKey, DateTime, func, Enum, Text, UniqueConstraint
)
from sqlalchemy.orm import relationship

from app.db.session import Base


class Order(Base):
    """
    One Order row = one checkout/placement event (one "order id" as per the
    requirement: "diff order id for order placed at a time in single placing in cart").
    """
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(40), unique=True, nullable=False, index=True)  # human-friendly local ID, e.g. ORD-2026-000123
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    shipping_address_id = Column(Integer, ForeignKey("addresses.id"), nullable=False)
    payment_type = Column(Enum("invoice_me", "credit_card", name="order_payment_type"), nullable=False)
    credit_card_id = Column(Integer, ForeignKey("credit_cards.id"), nullable=True)

    subtotal = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), nullable=False, default=0)
    shipping_amount = Column(Numeric(10, 2), nullable=False, default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)

    # Local order lifecycle status, independent of SAP delivery status
    status = Column(
        Enum("in_progress", "on_hold", "completed", "refunded", "cancelled", name="order_status"),
        default="in_progress",
        nullable=False,
        index=True,
    )

    # ---- SAP S/4HANA RAP integration fields ----
    sap_sales_order_number = Column(String(40), nullable=True, index=True)  # e.g. "SO-100456" returned by SAP
    sap_sync_status = Column(
        Enum("pending", "synced", "failed", name="sap_sync_status"),
        default="pending",
        nullable=False,
        index=True,
    )
    sap_sync_error = Column(Text, nullable=True)
    sap_sync_attempts = Column(Integer, default=0, nullable=False)
    sap_last_synced_at = Column(DateTime, nullable=True)

    # ---- Tracking ----
    tracking_status = Column(String(100), nullable=True)  # e.g. "Shipped", "Out for delivery"
    tracking_number = Column(String(100), nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    shipping_address = relationship("Address")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    product_name_snapshot = Column(String(255), nullable=False)  # preserves name at time of order
    sku_snapshot = Column(String(64), nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    line_total = Column(Numeric(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")


class FavouriteOrder(Base):
    """Heart-icon 'favourite' on an order tile in Order History."""
    __tablename__ = "favourite_orders"
    __table_args__ = (UniqueConstraint("user_id", "order_id", name="uq_user_favourite_order"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)

    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="favourite_orders")
    order = relationship("Order")
