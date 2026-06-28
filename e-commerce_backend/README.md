# E-Commerce Backend (FastAPI + MySQL + Kafka + SAP RAP Integration)

## 1. Project Structure

```
ecommerce-backend/
├── app/
│   ├── main.py                  # FastAPI app assembly, CORS, exception handlers, router registration
│   ├── core/
│   │   ├── config.py            # Settings loaded from .env (pydantic-settings)
│   │   ├── security.py          # Password hashing + JWT create/decode
│   │   ├── deps.py               # get_current_user / get_current_admin / get_optional_user
│   │   └── logging_config.py    # Centralized loguru setup (console + rotating file logs)
│   ├── db/
│   │   └── session.py           # SQLAlchemy engine, SessionLocal, Base, get_db()
│   ├── models/                  # SQLAlchemy ORM models (User, Address, CreditCard, Product, Cart, Order, ...)
│   ├── schemas/                 # Pydantic request/response schemas
│   ├── routers/                 # FastAPI routers (auth, profile, address, payment, product, cart, order)
│   ├── services/                # Business logic, separate from HTTP layer
│   ├── admin/                   # Admin-only router + schemas + user_service (role-gated CRUD)
│   ├── sap/
│   │   ├── auth.py               # OAuth2/Basic auth manager for SAP, with token caching
│   │   └── client.py             # SAP RAP OData V4 client: stock fetch + Sales Order creation, retries
│   └── kafka/
│       ├── producer.py           # Kafka event publisher (order.placed, notification.events, ...)
│       └── consumer.py           # Standalone worker consuming stock.updated -> updates MySQL
├── alembic/                      # DB migrations (env.py wired to app settings + models)
├── scripts/
│   └── seed_data.py              # Seeds an admin user + sample products (one out-of-stock)
├── requirements.txt
├── .env.example                  # Copy to .env and fill in real values
├── Dockerfile
├── docker-compose.yml            # MySQL + Zookeeper + Kafka + FastAPI app + stock-consumer worker
└── alembic.ini
```

## 2. Steps to Set Up

### Option A - Docker Compose (recommended, gets MySQL + Kafka + the API running together)

```bash
# 1. Clone/copy the project, then enter it
cd ecommerce-backend

# 2. Create your real .env from the example
cp .env.example .env
# edit .env: set JWT_SECRET_KEY, SAP_* values, etc.

# 3. Build and start everything (MySQL, Zookeeper, Kafka, topic-init, API, stock consumer)
docker compose up --build -d

# 4. Check the API is up
curl http://localhost:8000/health

# 5. Seed an admin user + sample products (run inside the app container)
docker compose exec app python -m scripts.seed_data

# 6. Open interactive API docs
# http://localhost:8000/api/docs
```

### Option B - Run locally without Docker (you provide MySQL + Kafka yourself)

```bash
# 1. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create your .env
cp .env.example .env
# edit DATABASE_URL to point at your MySQL instance, set JWT_SECRET_KEY, SAP_* values

# 4. Create the MySQL database (if it doesn't exist yet)
mysql -u root -p -e "CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4;"
mysql -u root -p -e "CREATE USER 'ecom_user'@'%' IDENTIFIED BY 'ecom_password'; GRANT ALL ON ecommerce_db.* TO 'ecom_user'@'%';"

# 5a. EITHER let the app auto-create tables on first run (APP_ENV=development in .env), OR
# 5b. Use Alembic migrations (recommended for anything beyond local dev):
alembic revision --autogenerate -m "initial schema"
alembic upgrade head

# 6. Seed sample data
python -m scripts.seed_data

# 7. Run the API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 8. (Optional, separate terminal) Run the Kafka stock-update consumer worker
python -m app.kafka.consumer
```

### Verifying SAP connectivity

The SAP RAP OData client (`app/sap/client.py`) is fully wired but needs real
values in `.env`:
- `SAP_BASE_URL`, `SAP_ODATA_SERVICE_PATH`
- For OAuth2 (`SAP_AUTH_TYPE=oauth2`): `SAP_OAUTH_TOKEN_URL`, `SAP_OAUTH_CLIENT_ID`, `SAP_OAUTH_CLIENT_SECRET`, `SAP_OAUTH_SCOPE`
- For Basic Auth (`SAP_AUTH_TYPE=basic`): `SAP_BASIC_USER`, `SAP_BASIC_PASSWORD`

Until you point it at a real SAP system, calls will fail at the network layer -
that's expected; the retry/error-handling logic is exercised either way.

## 3. Default Login (after seeding)

| Field    | Value              |
|----------|---------------------|
| Email    | admin@example.com  |
| Password | Admin@12345         |
| Role     | admin               |

Use `POST /api/v1/auth/login` with `{"identifier": "admin@example.com", "password": "Admin@12345"}`
to get `access_token`/`refresh_token`. Pass `Authorization: Bearer <access_token>`
on subsequent requests, including all `/api/v1/admin/*` routes.

## 4. Key Endpoints (full list in /api/docs)

| Area | Method & Path |
|---|---|
| Auth | `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password` |
| Profile | `GET/PUT /api/v1/profile/account-details`, `PUT /api/v1/profile/change-password` |
| Addresses | `GET/POST /api/v1/addresses`, `PUT/DELETE /api/v1/addresses/{id}` |
| Payments | `GET/POST /api/v1/payments/credit-cards`, `PUT/DELETE /api/v1/payments/credit-cards/{id}`, `GET/PUT /api/v1/payments/preference` |
| Products (PLP/PDP) | `GET /api/v1/products`, `GET /api/v1/products/{id}`, `POST /api/v1/products/{id}/wishlist` |
| Cart | `GET /api/v1/cart`, `POST /api/v1/cart/items`, `PUT/DELETE /api/v1/cart/items/{id}` |
| Checkout | `GET /api/v1/checkout/shipping-billing`, `POST /api/v1/checkout/review`, `POST /api/v1/checkout/place-order` |
| Orders | `GET /api/v1/orders`, `GET /api/v1/orders/{id}`, `POST /api/v1/orders/{id}/favourite`, `POST /api/v1/orders/{id}/reorder`, `GET /api/v1/orders/tracking/all` |
| Admin | `GET/POST/PUT/DELETE /api/v1/admin/products`, `POST /api/v1/admin/products/sync-stock-from-sap`, `GET/PUT/DELETE /api/v1/admin/users` |

## 5. How the pieces fit together (architecture notes)

- **JWT in localStorage**: Angular calls `/auth/login`, stores `access_token`
  in `localStorage`, and sends `Authorization: Bearer <token>` on every call.
  `app/core/deps.py` validates it centrally on every protected router.
- **URL-based restriction**: enforced via FastAPI `Depends(get_current_user)`
  (any logged-in user) or `Depends(get_current_admin)` (role == "admin") -
  one source of truth, not duplicated per-route logic.
- **SAP integration**: After an order is committed to MySQL, `order_service.place_order()`
  calls `sap_client.create_sales_order()`. On success, `sap_sales_order_number`
  is stored on the same `Order` row and returned to Angular alongside the
  local `order_number`. On SAP failure, the order is NOT rolled back - it's
  marked `sap_sync_status="pending"/"failed"` and a Kafka event lets a
  background process retry independently (see `order_service.retry_sap_sync`
  and the `/admin/orders/{id}/sap-retry` endpoint).
- **Stock sync**: `product_service.refresh_stock_from_sap()` pulls live stock
  from SAP and updates `Product.is_in_stock`, which Angular's PLP uses to
  disable "Add to Cart". Alternatively, if SAP pushes changes outward, point
  that feed at Kafka topic `stock.updated` and `app/kafka/consumer.py` will
  apply it the same way.
- **Kafka usage**: `order.placed`, `notification.events` (e.g. password-changed
  emails), and `stock.updated` are all wired as topics. This keeps the door
  open to splitting any one service (e.g. Notifications, SAP-sync) into its
  own deployable microservice later without changing the event contract.
