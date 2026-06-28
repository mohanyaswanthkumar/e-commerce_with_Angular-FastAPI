from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.product import Product
from app.models.wishlist import WishlistItem
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate
from app.core.logging_config import logger
from app.sap.client import sap_client, SapServiceError, SapTransientError


def _wishlisted_product_ids(db: Session, user: User | None) -> set[int]:
    if user is None:
        return set()
    rows = db.query(WishlistItem.product_id).filter(WishlistItem.user_id == user.id).all()
    return {r[0] for r in rows}


def list_products_plp(
    db: Session,
    user: User | None,
    search: str | None = None,
    category_id: int | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[Product], int, set[int]]:
    query = db.query(Product).filter(Product.is_active.is_(True))

    if search:
        like = f"%{search}%"
        query = query.filter(or_(Product.name.ilike(like), Product.description.ilike(like)))
    if category_id:
        query = query.filter(Product.category_id == category_id)

    total = query.count()
    items = query.order_by(Product.id.desc()).offset((page - 1) * page_size).limit(page_size).all()

    wishlisted = _wishlisted_product_ids(db, user)
    return items, total, wishlisted


def get_product_pdp(db: Session, user: User | None, product_id: int) -> tuple[Product, bool]:
    product = db.query(Product).filter(Product.id == product_id, Product.is_active.is_(True)).first()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    wishlisted = product.id in _wishlisted_product_ids(db, user)
    return product, wishlisted


def toggle_wishlist(db: Session, user: User, product_id: int) -> bool:
    """Returns True if now wishlisted, False if removed."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    existing = db.query(WishlistItem).filter(
        WishlistItem.user_id == user.id, WishlistItem.product_id == product_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return False

    db.add(WishlistItem(user_id=user.id, product_id=product_id))
    db.commit()
    return True


def refresh_stock_from_sap(db: Session, product_ids: list[int] | None = None) -> dict:
    """
    Calls SAP RAP OData to refresh stock for given products (or all active
    products if none specified), then updates `is_in_stock` / `stock_quantity`.

    This can be invoked:
      - On a schedule (cron / Celery beat) for proactive sync, or
      - On-demand right before rendering PLP for guaranteed freshness, or
      - Triggered by the Kafka `stock.updated` consumer (see app/kafka/consumer.py)
        if SAP pushes changes outward instead of being polled.
    """
    query = db.query(Product).filter(Product.is_active.is_(True))
    if product_ids:
        query = query.filter(Product.id.in_(product_ids))
    products = query.all()

    if not products:
        return {"updated": 0}

    sku_to_product = {p.sku: p for p in products}

    try:
        stock_data = sap_client.get_stock_for_materials(list(sku_to_product.keys()))
    except SapServiceError as exc:
        logger.error("product.stock_sync | SAP rejected stock request: {}", exc)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Could not refresh stock from SAP")
    except SapTransientError as exc:
        logger.error("product.stock_sync | SAP unavailable after retries: {}", exc)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="SAP stock service temporarily unavailable")

    updated = 0
    for sku, info in stock_data.items():
        product = sku_to_product.get(sku)
        if product is None:
            continue
        product.is_in_stock = info["is_in_stock"]
        product.stock_quantity = info["quantity"]
        updated += 1

    db.commit()
    logger.info("product.stock_sync | Refreshed stock for {} products from SAP", updated)
    return {"updated": updated}


# ---------------- Admin CRUD ----------------

def admin_create_product(db: Session, payload: ProductCreate) -> Product:
    existing = db.query(Product).filter(Product.sku == payload.sku).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A product with this SKU already exists")

    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    logger.info("admin.product.create | Created product_id={} sku={}", product.id, product.sku)
    return product


def admin_update_product(db: Session, product_id: int, payload: ProductUpdate) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    logger.info("admin.product.update | Updated product_id={}", product.id)
    return product


def admin_delete_product(db: Session, product_id: int) -> None:
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    db.delete(product)
    db.commit()
    logger.info("admin.product.delete | Deleted product_id={}", product_id)


def admin_list_products(db: Session, page: int = 1, page_size: int = 20) -> tuple[list[Product], int]:
    query = db.query(Product)
    total = query.count()
    items = query.order_by(Product.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return items, total
