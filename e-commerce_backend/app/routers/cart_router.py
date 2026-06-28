"""
/api/v1/cart/* - cart icon in header navigates here.
The "Added to cart" popup (image + price) is returned directly from the
add-to-cart call so the frontend doesn't need a second round trip.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.cart import (
    AddToCartRequest, UpdateCartItemRequest, CartOut, CartItemOut, AddedToCartPopupOut,
)
from app.services import cart_service

router = APIRouter(prefix="/cart", tags=["Cart"])


def _serialize_cart(cart) -> CartOut:
    totals = cart_service.calculate_totals(cart)
    items = [
        CartItemOut(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product.name,
            product_image_url=item.product.image_url,
            unit_price=item.product.price,
            quantity=item.quantity,
            line_total=item.product.price * item.quantity,
            is_in_stock=item.product.is_in_stock,
        )
        for item in cart.items
    ]
    return CartOut(id=cart.id, items=items, updated_at=cart.updated_at, **totals)


@router.get("", response_model=CartOut)
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = cart_service.get_cart_with_items(db, current_user)
    return _serialize_cart(cart)


@router.post("/items", response_model=AddedToCartPopupOut, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    payload: AddToCartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart, product = cart_service.add_to_cart(db, current_user, payload.product_id, payload.quantity)
    added_item = next(i for i in cart.items if i.product_id == payload.product_id)
    return AddedToCartPopupOut(
        product_id=product.id,
        product_name=product.name,
        product_image_url=product.image_url,
        price=product.price,
        quantity_in_cart=added_item.quantity,
    )


@router.put("/items/{item_id}", response_model=CartOut)
def update_cart_item(
    item_id: int,
    payload: UpdateCartItemRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = cart_service.update_cart_item(db, current_user, item_id, payload.quantity)
    return _serialize_cart(cart)


@router.delete("/items/{item_id}", response_model=CartOut)
def remove_cart_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = cart_service.remove_cart_item(db, current_user, item_id)
    return _serialize_cart(cart)
