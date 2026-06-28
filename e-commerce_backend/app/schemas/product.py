from datetime import datetime
from decimal import Decimal
from typing import Optional, List

from pydantic import BaseModel, Field, ConfigDict


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str


class ProductCardOut(BaseModel):
    """Used on PLP — image, wishlist-icon state, quantity box, add-to-cart, price."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    sku: str
    name: str
    price: Decimal
    image_url: Optional[str] = None
    is_in_stock: bool
    is_wishlisted: bool = False  # populated by the service layer per-request, not a DB column


class ProductDetailOut(BaseModel):
    """Used on PDP — adds full description."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    sku: str
    name: str
    description: Optional[str] = None
    detailed_description: Optional[str] = None
    price: Decimal
    image_url: Optional[str] = None
    is_in_stock: bool
    stock_quantity: int
    category: Optional[CategoryOut] = None
    is_wishlisted: bool = False


class ProductListResponse(BaseModel):
    items: List[ProductCardOut]
    total: int
    page: int
    page_size: int


class ProductCreate(BaseModel):
    sku: str = Field(..., max_length=64)
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    detailed_description: Optional[str] = None
    price: Decimal = Field(..., gt=0)
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    stock_quantity: int = Field(default=0, ge=0)
    is_active: bool = True


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    detailed_description: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class ProductAdminOut(ProductDetailOut):
    is_active: bool
    created_at: datetime
    updated_at: datetime
