"""
/api/v1/admin/* - every route here requires get_current_admin (role == "admin").
This is the dynamic setup for admins to perform CRUD on products and users.
"""
from typing import Optional, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductAdminOut,
)
from app.admin.schemas import AdminUserOut, AdminUserUpdate, AdminUserListResponse
from app.services import product_service
from app.admin import user_service

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(get_current_admin)])


# ---------------- Product CRUD ----------------

@router.get("/products", response_model=List[ProductAdminOut])
def admin_list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, _ = product_service.admin_list_products(db, page, page_size)
    return items


@router.post("/products", response_model=ProductAdminOut, status_code=201)
def admin_create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    return product_service.admin_create_product(db, payload)


@router.put("/products/{product_id}", response_model=ProductAdminOut)
def admin_update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    return product_service.admin_update_product(db, product_id, payload)


@router.delete("/products/{product_id}", status_code=204)
def admin_delete_product(product_id: int, db: Session = Depends(get_db)):
    product_service.admin_delete_product(db, product_id)
    return None


@router.post("/products/sync-stock-from-sap", status_code=200)
def admin_sync_stock(
    product_ids: Optional[List[int]] = Query(None, description="Omit to refresh all active products"),
    db: Session = Depends(get_db),
):
    """Manually trigger a SAP RAP OData stock refresh - same logic used by the scheduled job."""
    return product_service.refresh_stock_from_sap(db, product_ids)


# ---------------- User Management ----------------

@router.get("/users", response_model=AdminUserListResponse)
def admin_list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, total = user_service.list_users(db, page, page_size)
    return AdminUserListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/users/{user_id}", response_model=AdminUserOut)
def admin_get_user(user_id: int, db: Session = Depends(get_db)):
    return user_service.get_user_or_404(db, user_id)


@router.put("/users/{user_id}", response_model=AdminUserOut)
def admin_update_user(
    user_id: int,
    payload: AdminUserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return user_service.update_user(db, admin, user_id, payload)


@router.delete("/users/{user_id}", status_code=204)
def admin_deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user_service.deactivate_user(db, admin, user_id)
    return None
