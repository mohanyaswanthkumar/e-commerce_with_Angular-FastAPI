from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.address import Address
from app.models.user import User
from app.schemas.address import AddressCreate, AddressUpdate
from app.core.logging_config import logger


def list_addresses(db: Session, user: User) -> list[Address]:
    return db.query(Address).filter(Address.user_id == user.id).order_by(Address.is_default.desc(), Address.id.desc()).all()


def _unset_other_defaults(db: Session, user_id: int, exclude_id: int | None = None):
    query = db.query(Address).filter(Address.user_id == user_id, Address.is_default.is_(True))
    if exclude_id is not None:
        query = query.filter(Address.id != exclude_id)
    query.update({"is_default": False})


def create_address(db: Session, user: User, payload: AddressCreate) -> Address:
    address = Address(user_id=user.id, **payload.model_dump())
    db.add(address)
    db.flush()

    if payload.is_default:
        _unset_other_defaults(db, user.id, exclude_id=address.id)

    db.commit()
    db.refresh(address)
    logger.info("address.create | Created address_id={} for user_id={}", address.id, user.id)
    return address


def get_address_or_404(db: Session, user: User, address_id: int) -> Address:
    address = db.query(Address).filter(Address.id == address_id, Address.user_id == user.id).first()
    if address is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    return address


def update_address(db: Session, user: User, address_id: int, payload: AddressUpdate) -> Address:
    address = get_address_or_404(db, user, address_id)
    for field, value in payload.model_dump().items():
        setattr(address, field, value)

    if payload.is_default:
        _unset_other_defaults(db, user.id, exclude_id=address.id)

    db.commit()
    db.refresh(address)
    return address


def delete_address(db: Session, user: User, address_id: int) -> None:
    address = get_address_or_404(db, user, address_id)
    db.delete(address)
    db.commit()
    logger.info("address.delete | Deleted address_id={} for user_id={}", address_id, user.id)
