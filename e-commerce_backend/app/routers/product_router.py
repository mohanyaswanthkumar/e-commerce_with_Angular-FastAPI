"""
/api/v1/products/* — Product Listing Page (PLP) and Product Detail Page (PDP).
PLP/PDP are accessible to guests too (get_optional_user) so wishlist-icon
state is personalized when logged in but the page itself isn't gated.
"""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_optional_user, get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.product import ProductListResponse, ProductCardOut, ProductDetailOut
from app.services import product_service

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=ProductListResponse)
def get_plp(
    search: Optional[str] = Query(None, description="Dynamic search bar query - matches name/description"),
    category_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    items, total, wishlisted_ids = product_service.list_products_plp(
        db, current_user, search=search, category_id=category_id, page=page, page_size=page_size
    )
    cards = [
        ProductCardOut(
            id=p.id, sku=p.sku, name=p.name, price=p.price, image_url=p.image_url,
            is_in_stock=p.is_in_stock, is_wishlisted=p.id in wishlisted_ids,
        )
        for p in items
    ]
    return ProductListResponse(items=cards, total=total, page=page, page_size=page_size)


@router.get("/{product_id}", response_model=ProductDetailOut)
def get_pdp(
    product_id: int,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    product, is_wishlisted = product_service.get_product_pdp(db, current_user, product_id)
    return ProductDetailOut(
        id=product.id, sku=product.sku, name=product.name,
        description=product.description, detailed_description=product.detailed_description,
        price=product.price, image_url=product.image_url, is_in_stock=product.is_in_stock,
        stock_quantity=product.stock_quantity,
        category=product.category, is_wishlisted=is_wishlisted,
    )


@router.post("/{product_id}/wishlist", status_code=200)
def toggle_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    is_wishlisted = product_service.toggle_wishlist(db, current_user, product_id)
    return {"product_id": product_id, "is_wishlisted": is_wishlisted}
