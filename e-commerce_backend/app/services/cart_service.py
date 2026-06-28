from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User
from app.core.logging_config import logger

TAX_RATE = Decimal("0.08")          # 8% — replace with real tax-jurisdiction logic
FLAT_SHIPPING_FEE = Decimal("5.00")  # replace with carrier-rate lookup if needed
FREE_SHIPPING_THRESHOLD = Decimal("100.00")


def _get_or_create_cart(db: Session, user: User) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if cart is None:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


def get_cart_with_items(db: Session, user: User) -> Cart:
    cart = _get_or_create_cart(db, user)
    # Re-query with eager-loaded product relationship to avoid N+1 lookups when serializing
    cart = (
        db.query(Cart)
        .options(joinedload(Cart.items).joinedload(CartItem.product))
        .filter(Cart.id == cart.id)
        .first()
    )
    return cart


def calculate_totals(cart: Cart) -> dict:
    subtotal = sum((item.product.price * item.quantity for item in cart.items), Decimal("0.00"))
    tax_amount = (subtotal * TAX_RATE).quantize(Decimal("0.01"))
    shipping_amount = Decimal("0.00") if subtotal >= FREE_SHIPPING_THRESHOLD or subtotal == 0 else FLAT_SHIPPING_FEE
    total_amount = subtotal + tax_amount + shipping_amount
    return {
        "subtotal": subtotal,
        "tax_amount": tax_amount,
        "shipping_amount": shipping_amount,
        "total_amount": total_amount,
    }


def add_to_cart(db: Session, user: User, product_id: int, quantity: int) -> tuple[Cart, Product]:
    product = db.query(Product).filter(Product.id == product_id, Product.is_active.is_(True)).first()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if not product.is_in_stock:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product is out of stock")

    cart = _get_or_create_cart(db, user)
    existing_item = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.product_id == product_id).first()

    if existing_item:
        existing_item.quantity += quantity
    else:
        existing_item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
        db.add(existing_item)

    db.commit()
    logger.info("cart.add | user_id={} product_id={} quantity={}", user.id, product_id, quantity)

    cart = get_cart_with_items(db, user)
    return cart, product


def update_cart_item(db: Session, user: User, item_id: int, quantity: int) -> Cart:
    cart = _get_or_create_cart(db, user)
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    item.quantity = quantity
    db.commit()
    return get_cart_with_items(db, user)


def remove_cart_item(db: Session, user: User, item_id: int) -> Cart:
    cart = _get_or_create_cart(db, user)
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    db.delete(item)
    db.commit()
    logger.info("cart.remove | user_id={} item_id={}", user.id, item_id)
    return get_cart_with_items(db, user)


def clear_cart(db: Session, user: User) -> None:
    cart = _get_or_create_cart(db, user)
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
