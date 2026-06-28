from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict


class AddToCartRequest(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class UpdateCartItemRequest(BaseModel):
    quantity: int = Field(..., ge=1)


class CartItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: str
    product_image_url: Optional[str] = None
    unit_price: Decimal
    quantity: int
    line_total: Decimal
    is_in_stock: bool


class CartOut(BaseModel):
    id: int
    items: List[CartItemOut]
    subtotal: Decimal
    tax_amount: Decimal
    shipping_amount: Decimal
    total_amount: Decimal
    updated_at: datetime


class AddedToCartPopupOut(BaseModel):
    """Minimal payload for the 'Added to cart' popup (image + price) shown from PLP/PDP."""
    product_id: int
    product_name: str
    product_image_url: Optional[str] = None
    price: Decimal
    quantity_in_cart: int
