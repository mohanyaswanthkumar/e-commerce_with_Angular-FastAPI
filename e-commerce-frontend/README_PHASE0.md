# ShopEase Angular Frontend — Phase 0

## What's included in this phase
- Full Angular 17 (standalone components) project scaffold: `package.json`, `angular.json`, `tsconfig*.json`, `main.ts`, `index.html`, `styles.scss`.
- `environments/environment.ts` + `environment.prod.ts` pointed at the FastAPI backend (`/api/v1`).
- `core/models/*` — TypeScript interfaces mirroring every Pydantic schema in `app/schemas/*.py` (user, product, cart, order, address, payment) exactly, field-for-field.
- `core/constants/api-endpoints.ts` — single source of truth for every backend route (matches `app/main.py` + each router prefix).
- `core/services/token-storage.service.ts` — JWT stored in `localStorage`, per requirement.
- `core/services/auth.service.ts` — login / register / refresh / forgot-password / reset-password, exposes `isAuthenticated`, `isAdmin`, `currentUser` as signals.
- `core/services/notification.service.ts` — global toast bus used by the error interceptor.
- `core/interceptors/auth.interceptor.ts` — attaches `Authorization: Bearer <token>`, auto-refreshes once on 401.
- `core/interceptors/error.interceptor.ts` — surfaces backend error messages (matches FastAPI's `{message, detail}` / validation-error shape from `app/main.py`).
- `core/guards/auth.guard.ts`, `admin.guard.ts`, `guest.guard.ts` — URL-based restriction on the frontend, mirroring `get_current_user` / `get_current_admin` in `app/core/deps.py`.
- `shared/components/header` — global dynamic header (logo, products link, dynamic search bar, unauth Login link vs. auth "Hi <name>" dropdown with My orders / My profile / Payment information / Addresses / Logout).
- `shared/components/footer` — global footer.
- `features/auth/login` — email-or-mobile + password, Login/Register CTAs, Forgot password link.
- `features/auth/register` — first name, last name, email, password, mobile.
- `features/home` — auth-homepage (banner + Order history / Personal details / Start new order / Continue Shopping) and a guest landing hero.
- `app.routes.ts` — routes wired for Phase 0, with commented stubs for every Phase 1+ route so the full site map is already agreed.

## How to run (once you `npm install`)
```bash
npm install
npm start        # ng serve, http://localhost:4200
```
Make sure the FastAPI backend is running on `http://localhost:8000` (or update `src/environments/environment.ts`).

## Planned for Phase 1
- PLP (`/products`) + PDP (`/products/:id`) + "Added to cart" popup + `cart.service.ts` / `product.service.ts`.
- Cart page's 3 steps (Shipping & Billing / Order Review / Order Confirmation), showing **both** Local Order ID and SAP Sales Order Number.
- Order history, Track my order, Reorder, Favourites.

## Planned for Phase 2
- Account details, Change password, Addresses CRUD, Credit cards CRUD, Default payment preference.

## Planned for Phase 3
- Admin dashboard (product CRUD, user CRUD, SAP stock sync trigger).
- Wishlist page.
- Polish: loading skeletons, pagination, guards refinement, unit tests.
