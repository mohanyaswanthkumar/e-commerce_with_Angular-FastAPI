from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func, Enum
from sqlalchemy.orm import relationship

from app.db.session import Base


class CreditCard(Base):
    __tablename__ = "credit_cards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    cardholder_name = Column(String(150), nullable=False)
    # Only store a masked/last-4 representation + a tokenized reference from the
    # payment gateway. NEVER persist full PAN/CVV in your own DB in production.
    card_number_masked = Column(String(25), nullable=False)   # e.g. "**** **** **** 1234"
    card_token = Column(String(255), nullable=False)          # gateway token reference
    expiry_month = Column(String(2), nullable=False)
    expiry_year = Column(String(4), nullable=False)
    card_brand = Column(String(20), nullable=True)             # VISA / MASTERCARD / AMEX

    status = Column(Enum("active", "expired", name="card_status"), default="active", nullable=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="credit_cards")


class PaymentPreference(Base):
    __tablename__ = "payment_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    preference_type = Column(Enum("invoice_me", "credit_card", name="payment_pref_type"), nullable=False)
    default_credit_card_id = Column(Integer, ForeignKey("credit_cards.id"), nullable=True)

    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="payment_preference")
