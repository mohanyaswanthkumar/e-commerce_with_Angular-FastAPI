from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.payment import CreditCard, PaymentPreference
from app.models.user import User
from app.schemas.payment import CreditCardCreate, CreditCardUpdate, PaymentPreferenceUpdate
from app.core.logging_config import logger

CARD_BRAND_PREFIXES = {
    "4": "VISA",
    "5": "MASTERCARD",
    "3": "AMEX",
}


def _mask_card_number(card_number: str) -> str:
    return f"**** **** **** {card_number[-4:]}"


def _detect_brand(card_number: str) -> str:
    return CARD_BRAND_PREFIXES.get(card_number[0], "UNKNOWN")


def _tokenize_card(card_number: str, cvv: str) -> str:
    """
    Placeholder for a real payment-gateway tokenization call (e.g. Stripe,
    Braintree, Adyen). NEVER persist raw PAN/CVV — only the gateway's token.
    """
    # In production: token = payment_gateway_client.tokenize(card_number, cvv)
    return f"tok_{card_number[-4:]}_{datetime.utcnow().timestamp():.0f}"


def _is_expired(expiry_month: str, expiry_year: str) -> bool:
    now = datetime.utcnow()
    return int(expiry_year) < now.year or (int(expiry_year) == now.year and int(expiry_month) < now.month)


def list_credit_cards(db: Session, user: User) -> list[CreditCard]:
    cards = db.query(CreditCard).filter(CreditCard.user_id == user.id).order_by(CreditCard.id.desc()).all()
    # Refresh expired status live (could also run via a daily batch job)
    for card in cards:
        if _is_expired(card.expiry_month, card.expiry_year) and card.status == "active":
            card.status = "expired"
    db.commit()
    return cards


def add_credit_card(db: Session, user: User, payload: CreditCardCreate) -> CreditCard:
    card = CreditCard(
        user_id=user.id,
        cardholder_name=payload.cardholder_name,
        card_number_masked=_mask_card_number(payload.card_number),
        card_token=_tokenize_card(payload.card_number, payload.cvv),
        expiry_month=payload.expiry_month,
        expiry_year=payload.expiry_year,
        card_brand=_detect_brand(payload.card_number),
        status="expired" if _is_expired(payload.expiry_month, payload.expiry_year) else "active",
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    logger.info("payment.add_card | Added card_id={} for user_id={}", card.id, user.id)
    return card


def get_card_or_404(db: Session, user: User, card_id: int) -> CreditCard:
    card = db.query(CreditCard).filter(CreditCard.id == card_id, CreditCard.user_id == user.id).first()
    if card is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit card not found")
    return card


def update_credit_card(db: Session, user: User, card_id: int, payload: CreditCardUpdate) -> CreditCard:
    card = get_card_or_404(db, user, card_id)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(card, field, value)
    db.commit()
    db.refresh(card)
    return card


def delete_credit_card(db: Session, user: User, card_id: int) -> None:
    card = get_card_or_404(db, user, card_id)
    db.delete(card)
    db.commit()
    logger.info("payment.delete_card | Deleted card_id={} for user_id={}", card_id, user.id)


def get_payment_preference(db: Session, user: User) -> PaymentPreference | None:
    return db.query(PaymentPreference).filter(PaymentPreference.user_id == user.id).first()


def set_payment_preference(db: Session, user: User, payload: PaymentPreferenceUpdate) -> PaymentPreference:
    if payload.preference_type == "credit_card":
        if payload.default_credit_card_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="default_credit_card_id is required when preference_type is credit_card",
            )
        get_card_or_404(db, user, payload.default_credit_card_id)  # ensures ownership + existence

    pref = get_payment_preference(db, user)
    if pref is None:
        pref = PaymentPreference(user_id=user.id, **payload.model_dump())
        db.add(pref)
    else:
        for field, value in payload.model_dump().items():
            setattr(pref, field, value)

    db.commit()
    db.refresh(pref)
    return pref
