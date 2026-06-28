"""
Centralized application configuration.
All environment-dependent values are loaded here via pydantic-settings.
Never hardcode secrets elsewhere in the codebase — import `settings` instead.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ---- App ----
    APP_NAME: str = "ecommerce-backend"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # ---- Security / JWT ----
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080

    # ---- Database ----
    DATABASE_URL: str

    # ---- Kafka ----
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_CLIENT_ID: str = "ecommerce-backend"
    KAFKA_GROUP_ID: str = "ecommerce-backend-group"
    KAFKA_TOPIC_ORDER_PLACED: str = "order.placed"
    KAFKA_TOPIC_ORDER_CONFIRMED: str = "order.confirmed"
    KAFKA_TOPIC_STOCK_UPDATED: str = "stock.updated"
    KAFKA_TOPIC_PAYMENT_EVENTS: str = "payment.events"
    KAFKA_TOPIC_NOTIFICATION_EVENTS: str = "notification.events"
    KAFKA_ENABLED: bool = True

    # ---- SAP RAP OData ----
    SAP_BASE_URL: str
    SAP_ODATA_SERVICE_PATH: str
    SAP_AUTH_TYPE: str = "oauth2"  # "oauth2" or "basic"
    SAP_OAUTH_TOKEN_URL: str = ""
    SAP_OAUTH_CLIENT_ID: str = ""
    SAP_OAUTH_CLIENT_SECRET: str = ""
    SAP_OAUTH_SCOPE: str = ""
    SAP_BASIC_USER: str = ""
    SAP_BASIC_PASSWORD: str = ""
    SAP_REQUEST_TIMEOUT_SECONDS: int = 15
    SAP_MAX_RETRIES: int = 3

    # ---- CORS ----
    CORS_ORIGINS: str = "http://localhost:4200"

    # ---- SMTP ----
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton — avoids re-parsing .env on every import."""
    return Settings()


settings = get_settings()
