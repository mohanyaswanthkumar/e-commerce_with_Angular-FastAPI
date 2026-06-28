"""
/api/v1/payments/* — "Payment information" subsection (credit cards +
default payment preference) under the hi-customer dropdown.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.payment import (
    CreditCardCreate, CreditCardUpdate, CreditCardOut,
    PaymentPreferenceUpdate, PaymentPreferenceOut,
)
from app.services import payment_service

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.get("/credit-cards", response_model=List[CreditCardOut])
def list_credit_cards(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return payment_service.list_credit_cards(db, current_user)


@router.post("/credit-cards", response_model=CreditCardOut, status_code=status.HTTP_201_CREATED)
def add_credit_card(
    payload: CreditCardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return payment_service.add_credit_card(db, current_user, payload)


@router.put("/credit-cards/{card_id}", response_model=CreditCardOut)
def update_credit_card(
    card_id: int,
    payload: CreditCardUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return payment_service.update_credit_card(db, current_user, card_id, payload)


@router.delete("/credit-cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_credit_card(
    card_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payment_service.delete_credit_card(db, current_user, card_id)
    return None


@router.get("/preference", response_model=Optional[PaymentPreferenceOut])
def get_payment_preference(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return payment_service.get_payment_preference(db, current_user)


@router.put("/preference", response_model=PaymentPreferenceOut)
def set_payment_preference(
    payload: PaymentPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return payment_service.set_payment_preference(db, current_user, payload)
