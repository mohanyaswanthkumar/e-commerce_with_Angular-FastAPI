from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.admin.schemas import AdminUserUpdate
from app.core.logging_config import logger


def list_users(db: Session, page: int = 1, page_size: int = 20) -> tuple[list[User], int]:
    query = db.query(User)
    total = query.count()
    items = query.order_by(User.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def get_user_or_404(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def update_user(db: Session, admin: User, user_id: int, payload: AdminUserUpdate) -> User:
    user = get_user_or_404(db, user_id)

    if user.id == admin.id and payload.role and payload.role != "admin":
        # Prevent an admin from accidentally demoting/locking themselves out
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot change your own admin role")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    logger.info("admin.user.update | admin_id={} updated user_id={} fields={}", admin.id, user_id, list(update_data.keys()))
    return user


def deactivate_user(db: Session, admin: User, user_id: int) -> None:
    if user_id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot deactivate your own account")
    user = get_user_or_404(db, user_id)
    user.is_active = False
    db.commit()
    logger.info("admin.user.deactivate | admin_id={} deactivated user_id={}", admin.id, user_id)
