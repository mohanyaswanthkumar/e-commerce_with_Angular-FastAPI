from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel, EmailStr, Field, ConfigDict


class AdminUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    email: EmailStr
    mobile_number: str
    role: str
    is_active: bool
    created_at: datetime


class AdminUserUpdate(BaseModel):
    """
    Admin-driven user management with privacy controls: admins can change role
    and active status, but never read/write the password hash directly here.
    """
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    mobile_number: Optional[str] = Field(None, max_length=20)
    role: Optional[Literal["customer", "admin"]] = None
    is_active: Optional[bool] = None


class AdminUserListResponse(BaseModel):
    items: list[AdminUserOut]
    total: int
    page: int
    page_size: int
