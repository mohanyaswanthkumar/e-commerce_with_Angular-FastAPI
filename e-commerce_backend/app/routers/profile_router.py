"""
/api/v1/profile/* — "My Profile" section of the hi-customer dropdown.
All routes require a valid JWT (Depends(get_current_user)) — enforces the
"URL based restriction" requirement centrally.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserOut, AccountDetailsUpdate, ChangePasswordRequest
from app.services import profile_service

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("/account-details", response_model=UserOut)
def get_account_details(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/account-details", response_model=UserOut)
def update_account_details(
    payload: AccountDetailsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return profile_service.update_account_details(db, current_user, payload)


@router.put("/change-password", status_code=200)
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile_service.change_password(db, current_user, payload)
    return {"message": "Password changed successfully. A confirmation email has been sent."}
