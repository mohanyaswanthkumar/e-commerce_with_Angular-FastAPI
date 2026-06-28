from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel, Field, ConfigDict, field_validator


class CreditCardCreate(BaseModel):
    cardholder_name: str = Field(..., max_length=150)
    card_number: str = Field(..., min_length=12, max_length=19, description="Raw PAN; tokenized before storage")
    cvv: str = Field(..., min_length=3, max_length=4)
    expiry_month: str = Field(..., min_length=2, max_length=2)
    expiry_year: str = Field(..., min_length=4, max_length=4)

    @field_validator("card_number")
    @classmethod
    def digits_only(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError("card_number must contain digits only")
        return v


class CreditCardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cardholder_name: str
    card_number_masked: str
    expiry_month: str
    expiry_year: str
    card_brand: Optional[str] = None
    status: Literal["active", "expired"]
    created_at: datetime


class CreditCardUpdate(BaseModel):
    cardholder_name: Optional[str] = Field(None, max_length=150)
    expiry_month: Optional[str] = Field(None, min_length=2, max_length=2)
    expiry_year: Optional[str] = Field(None, min_length=4, max_length=4)


class PaymentPreferenceUpdate(BaseModel):
    preference_type: Literal["invoice_me", "credit_card"]
    default_credit_card_id: Optional[int] = None


class PaymentPreferenceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    preference_type: Literal["invoice_me", "credit_card"]
    default_credit_card_id: Optional[int] = None
