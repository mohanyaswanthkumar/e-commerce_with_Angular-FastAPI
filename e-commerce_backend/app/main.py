"""
Application entrypoint.

Run locally with:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

URL-based restriction summary (per requirement):
  - /api/v1/auth/*            -> public
  - /api/v1/products*         -> public (GET), wishlist POST requires auth
  - /api/v1/cart*, /profile*,
    /addresses*, /payments*,
    /orders*, /checkout*      -> requires valid JWT (get_current_user)
  - /api/v1/admin/*           -> requires JWT AND role == "admin" (get_current_admin)
This is enforced centrally via FastAPI Depends(...) in app/core/deps.py,
not re-implemented per route, so there is a single source of truth for access control.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.logging_config import logger
from app.db.session import Base, engine

# Import routers
from app.routers import (
    auth_router, profile_router, address_router, payment_router,
    product_router, cart_router, order_router,
)
from app.admin.router import router as admin_router

# Import SAP error types for global exception handling
from app.sap.client import SapServiceError, SapTransientError


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ---- Startup ----
    logger.info("app.startup | {} starting in {} mode", settings.APP_NAME, settings.APP_ENV)
    # NOTE: In production, schema management should go through Alembic migrations
    # (see alembic/ directory + README "Database Migrations" section), not create_all().
    # create_all() is convenient for first-run local/dev bootstrapping only.
    if settings.APP_ENV == "development":
        Base.metadata.create_all(bind=engine)
        logger.info("app.startup | Dev mode: ensured all tables exist via create_all()")

    yield

    # ---- Shutdown ----
    logger.info("app.shutdown | Flushing Kafka producer and shutting down {}", settings.APP_NAME)
    from app.kafka.producer import kafka_producer
    kafka_producer.flush()


app = FastAPI(
    title="E-Commerce Backend API",
    description="FastAPI microservice backend for the Angular e-commerce frontend, integrated with SAP S/4HANA RAP (OData V4) and Kafka.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- Global exception handlers ----------------

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning("validation_error | path={} errors={}", request.url.path, exc.errors())
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "message": "Validation failed"},
    )


@app.exception_handler(SapServiceError)
async def sap_service_error_handler(request: Request, exc: SapServiceError):
    logger.error("sap_error | path={} status={} body={}", request.url.path, exc.status_code, exc.sap_error_body)
    return JSONResponse(
        status_code=status.HTTP_502_BAD_GATEWAY,
        content={"message": "SAP rejected the request", "detail": str(exc)},
    )


@app.exception_handler(SapTransientError)
async def sap_transient_error_handler(request: Request, exc: SapTransientError):
    logger.error("sap_error | path={} transient_error={}", request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"message": "SAP service temporarily unavailable, the request has been queued for retry", "detail": str(exc)},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("unhandled_exception | path={} error={}", request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": "An unexpected error occurred. Please try again later."},
    )


# ---------------- Routers ----------------
API_PREFIX = settings.API_V1_PREFIX

app.include_router(auth_router.router, prefix=API_PREFIX)
app.include_router(profile_router.router, prefix=API_PREFIX)
app.include_router(address_router.router, prefix=API_PREFIX)
app.include_router(payment_router.router, prefix=API_PREFIX)
app.include_router(product_router.router, prefix=API_PREFIX)
app.include_router(cart_router.router, prefix=API_PREFIX)
app.include_router(order_router.router, prefix=API_PREFIX)
app.include_router(admin_router, prefix=API_PREFIX)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "env": settings.APP_ENV}


@app.get("/", tags=["Health"])
def root():
    return {"message": f"{settings.APP_NAME} is running. See /api/docs for API documentation."}
