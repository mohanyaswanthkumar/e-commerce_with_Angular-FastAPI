"""
Centralized logging configuration using loguru.
Import `logger` anywhere in the app — no per-module logger setup needed.
"""
import sys
from loguru import logger

from app.core.config import settings

logger.remove()

logger.add(
    sys.stdout,
    level="DEBUG" if settings.DEBUG else "INFO",
    format=(
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>"
    ),
    backtrace=True,
    diagnose=settings.DEBUG,
)

logger.add(
    "logs/app.log",
    level="INFO",
    rotation="50 MB",
    retention="30 days",
    compression="zip",
    enqueue=True,  # safe for multi-process / async logging
)

logger.add(
    "logs/sap_integration.log",
    level="DEBUG",
    rotation="50 MB",
    retention="30 days",
    filter=lambda record: "sap" in record["name"].lower(),
    enqueue=True,
)

__all__ = ["logger"]
