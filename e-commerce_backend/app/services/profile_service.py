from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.core.logging_config import logger
from app.models.user import User
from app.schemas.user import AccountDetailsUpdate, ChangePasswordRequest
from app.kafka.producer import kafka_producer
from app.core.config import settings


def update_account_details(db: Session, user: User, payload: AccountDetailsUpdate) -> User:
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    logger.info("profile.account_details | Updated for user_id={}", user.id)
    return user


def change_password(db: Session, user: User, payload: ChangePasswordRequest) -> None:
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()

    # "password change page ... with mail triggering after saved"
    # Published as an event so a dedicated Notification microservice sends the email —
    # keeps SMTP/templating concerns out of the core API process.
    kafka_producer.publish(
        topic=settings.KAFKA_TOPIC_NOTIFICATION_EVENTS,
        key=str(user.id),
        value={
            "event_type": "password_changed",
            "user_id": user.id,
            "email": user.email,
        },
    )
    logger.info("profile.change_password | Password changed for user_id={}, notification event published", user.id)
