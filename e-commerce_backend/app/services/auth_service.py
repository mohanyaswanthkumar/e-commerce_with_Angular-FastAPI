import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.logging_config import logger
from app.models.user import User
from app.models.cart import Cart
from app.schemas.user import RegisterRequest, LoginRequest

# In-memory store for password-reset tokens. Swap for a Redis-backed store in
# production / multi-instance deployments so resets survive across replicas.
_password_reset_tokens: dict[str, dict] = {}


def register_user(db: Session, payload: RegisterRequest) -> User:
    existing = db.query(User).filter(
        or_(User.email == payload.email, User.mobile_number == payload.mobile_number)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email or mobile number already exists",
        )

    user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        mobile_number=payload.mobile_number,
        hashed_password=hash_password(payload.password),
        role="customer",
    )
    db.add(user)
    db.flush()  # get user.id before creating dependent cart row

    db.add(Cart(user_id=user.id))
    db.commit()
    db.refresh(user)

    logger.info("auth.register | New user registered id={} email={}", user.id, user.email)
    return user


def authenticate_user(db: Session, payload: LoginRequest) -> User:
    user = db.query(User).filter(
        or_(User.email == payload.identifier, User.mobile_number == payload.identifier)
    ).first()

    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    logger.info("auth.login | User authenticated id={}", user.id)
    return user


def issue_tokens(user: User) -> tuple[str, str]:
    access_token = create_access_token(str(user.id), role=user.role)
    refresh_token = create_refresh_token(str(user.id), role=user.role)
    return access_token, refresh_token


def refresh_access_token(db: Session, refresh_token: str) -> tuple[str, str]:
    payload = decode_token(refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer active")

    return issue_tokens(user)


def initiate_password_reset(db: Session, email: str) -> str | None:
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        # Don't reveal whether the email exists — return silently either way.
        logger.info("auth.forgot_password | Reset requested for unknown email (no-op)")
        return None

    reset_token = secrets.token_urlsafe(32)
    _password_reset_tokens[reset_token] = {
        "user_id": user.id,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=30),
    }
    logger.info("auth.forgot_password | Reset token issued for user_id={}", user.id)
    # In production: send `reset_token` via the email/notification service (Kafka event),
    # never return it directly to the API caller.
    return reset_token


def complete_password_reset(db: Session, reset_token: str, new_password: str) -> User:
    entry = _password_reset_tokens.get(reset_token)
    if entry is None or entry["expires_at"] < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token is invalid or expired")

    user = db.query(User).filter(User.id == entry["user_id"]).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.hashed_password = hash_password(new_password)
    db.commit()
    del _password_reset_tokens[reset_token]

    logger.info("auth.reset_password | Password reset completed for user_id={}", user.id)
    return user
