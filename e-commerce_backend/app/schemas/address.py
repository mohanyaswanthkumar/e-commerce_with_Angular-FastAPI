from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class AddressBase(BaseModel):
    label: Optional[str] = Field(None, max_length=50)
    full_name: str = Field(..., max_length=150)
    phone_number: str = Field(..., max_length=20)
    line1: str = Field(..., max_length=255)
    line2: Optional[str] = Field(None, max_length=255)
    city: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    postal_code: str = Field(..., max_length=20)
    country: str = Field(..., max_length=100)
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressUpdate(AddressBase):
    pass


class AddressOut(AddressBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
