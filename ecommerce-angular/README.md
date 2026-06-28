# ShopNow – Angular E-Commerce Frontend

Full Angular 17 standalone-component frontend connecting to the FastAPI backend at:
https://github.com/mohanyaswanthkumar/e-commerce_with_Angular-FastAPI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 17 (standalone components, signals) |
| Styling | SCSS with CSS variables (no third-party UI lib) |
| State | Angular Signals |
| HTTP | Angular HttpClient + functional interceptor |
| Auth | JWT stored in localStorage, auto-refresh |
| Routing | Angular Router with lazy-loaded components |
| Backend Proxy | Angular dev-server proxy → FastAPI on :8000 |

---

## Complete Project Structure

```
ecommerce-angular/
├── proxy.conf.json                  ← Dev proxy to FastAPI :8000
├── angular.json
├── tsconfig.json
├── tsconfig.app.json
├── package.json
└── src/
    ├── index.html
    ├── main.ts
    ├── favicon.ico
    ├── environments/
    │   ├── environment.ts           ← apiUrl: '/api/v1'
    │   └── environment.prod.ts
    ├── styles/
    │   └── global.scss              ← All global styles, variables, utilities
    └── app/
        ├── app.component.ts         ← Root component (header+router-outlet+footer)
        ├── app.config.ts            ← providers: router, httpClient+interceptor, animations
        ├── app.routes.ts            ← All routes with lazy loading + guards
        │
        ├── core/
        │   ├── guards/
        │   │   └── auth.guard.ts    ← authGuard, adminGuard, publicGuard
        │   ├── interceptors/
        │   │   └── auth.interceptor.ts  ← Attaches JWT, handles 401 refresh
        │   └── services/
        │       ├── auth.service.ts      ← Login/register/logout/token management
        │       ├── cart.service.ts      ← Cart state (signals), add/remove/update
        │       ├── order.service.ts     ← Checkout flow, order history, tracking
        │       ├── product.service.ts   ← Products CRUD, wishlist, categories
        │       ├── profile.service.ts   ← Account, addresses, cards, payment prefs, admin
        │       └── toast.service.ts     ← Global toast notifications (signals)
        │
        ├── shared/
        │   ├── models/
        │   │   └── index.ts         ← All TypeScript interfaces matching backend schemas
        │   └── components/
        │       ├── header/
        │       │   └── header.component.ts    ← Dynamic header with dropdown menu
        │       ├── footer/
        │       │   └── footer.component.ts
        │       ├── toast/
        │       │   └── toast-container.component.ts
        │       ├── cart-popup/
        │       │   └── cart-popup.component.ts  ← "Added to cart" popup
        │       └── not-found.component.ts
        │
        └── features/
            ├── auth/
            │   ├── login/
            │   │   ├── login.component.ts
            │   │   ├── forgot-password.component.ts
            │   │   └── reset-password.component.ts
            │   └── register/
            │       └── register.component.ts
            │
            ├── home/
            │   └── home.component.ts    ← Auth homepage with banner + CTAs
            │
            ├── products/
            │   ├── plp/
            │   │   └── plp.component.ts  ← Product listing with filters/search/pagination
            │   └── pdp/
            │       └── pdp.component.ts  ← Product detail with images/tabs/cart
            │
            ├── cart/
            │   ├── cart-shell.component.ts       ← 3-step checkout stepper wrapper
            │   ├── checkout-state.service.ts     ← Shared state across checkout steps
            │   ├── shipping/
            │   │   └── shipping.component.ts     ← Step 1: Address + Payment selection
            │   ├── review/
            │   │   └── review.component.ts       ← Step 2: Order review + place order
            │   └── confirmation/
            │       └── confirmation.component.ts ← Step 3: Success + order/SAP numbers
            │
            ├── orders/
            │   ├── history/
            │   │   └── order-history.component.ts  ← All/Favourite tabs, filters, reorder
            │   ├── detail/
            │   │   └── order-detail.component.ts   ← Full order details + reorder
            │   └── tracking/
            │       └── order-tracking.component.ts ← Visual tracking steps timeline
            │
            ├── wishlist/
            │   ├── wishlist.component.ts
            │   ├── wishlist.component.html
            │   └── wishlist.component.scss
            │
            ├── profile/
            │   ├── account/
            │   │   └── account.component.ts        ← Editable profile form
            │   ├── password/
            │   │   └── password.component.ts       ← Change password + email trigger
            │   ├── addresses/
            │   │   └── addresses.component.ts      ← CRUD addresses with modal
            │   └── payments/
            │       ├── credit-cards/
            │       │   └── credit-cards.component.ts  ← Card tiles + add/edit/delete
            │       └── preference/
            │           └── preference.component.ts    ← Invoice vs credit card preference
            │
            └── admin/
                ├── dashboard/
                │   ├── admin-dashboard.component.ts
                │   ├── admin-dashboard.component.html
                │   └── admin-dashboard.component.scss
                ├── products/
                │   ├── admin-products.component.ts
                │   ├── admin-products.component.html
                │   └── admin-products.component.scss
                └── users/
                    ├── admin-users.component.ts
                    ├── admin-users.component.html
                    └── admin-users.component.scss
```

---

## Step-by-Step Setup

### 1. Prerequisites

```bash
# Check Node.js version (need 18+)
node --version

# Check npm version (need 9+)
npm --version

# Install Angular CLI globally
npm install -g @angular/cli@17
```

### 2. Start the FastAPI Backend

```bash
# Clone and start the backend first
git clone https://github.com/mohanyaswanthkumar/e-commerce_with_Angular-FastAPI
cd e-commerce_with_Angular-FastAPI

# Install Python deps
pip install -r requirements.txt

# Set up MySQL DB (update .env with your credentials)
# Then run migrations / seed

# Start FastAPI
uvicorn app.main:app --reload --port 8000
```

Make sure backend is running at **http://localhost:8000**

### 3. Create Angular Project

```bash
# Create new Angular 17 project (in a new terminal)
ng new ecommerce-angular --standalone --routing --style=scss --skip-tests

cd ecommerce-angular
```

### 4. Copy All Source Files

Copy the entire `src/` folder from this project into the Angular project root, replacing the generated `src/` directory. Also copy:
- `proxy.conf.json` → project root
- `angular.json` → replace the generated one
- `tsconfig.json` → replace
- `tsconfig.app.json` → replace

```bash
# From project root, copy all files
cp -r /path/to/this/project/src ./src
cp /path/to/this/project/proxy.conf.json .
cp /path/to/this/project/angular.json .
cp /path/to/this/project/tsconfig.json .
cp /path/to/this/project/tsconfig.app.json .
```

### 5. Install Dependencies

```bash
npm install
```

No extra packages needed — uses only Angular core packages.

### 6. Configure Environment

Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: '/api/v1'   // proxied to localhost:8000/api/v1
};
```

The `proxy.conf.json` proxies all `/api` requests to FastAPI:
```json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true
  }
}
```

> **Important**: Make sure your FastAPI routes are prefixed with `/api/v1/...`
> If they use a different prefix, update `environment.ts` accordingly.

### 7. Run the Application

```bash
ng serve --open
```

Opens at **http://localhost:4200**

---

## API Endpoint Mapping

The Angular services call these FastAPI endpoints:

| Angular Service | HTTP | FastAPI Route |
|---|---|---|
| `auth.login()` | POST | `/api/v1/auth/login` |
| `auth.register()` | POST | `/api/v1/auth/register` |
| `auth.refreshToken()` | POST | `/api/v1/auth/refresh` |
| `auth.forgotPassword()` | POST | `/api/v1/auth/forgot-password` |
| `productService.getProducts()` | GET | `/api/v1/products` |
| `productService.getProduct(id)` | GET | `/api/v1/products/:id` |
| `productService.toggleWishlist()` | POST | `/api/v1/products/:id/wishlist` |
| `productService.getWishlist()` | GET | `/api/v1/products/wishlist` |
| `productService.getCategories()` | GET | `/api/v1/products/categories` |
| `cartService.loadCart()` | GET | `/api/v1/cart` |
| `cartService.addItem()` | POST | `/api/v1/cart/items` |
| `cartService.updateItem()` | PUT | `/api/v1/cart/items/:id` |
| `cartService.removeItem()` | DELETE | `/api/v1/cart/items/:id` |
| `orderService.getShippingBillingInfo()` | GET | `/api/v1/checkout/shipping-billing` |
| `orderService.reviewOrder()` | POST | `/api/v1/checkout/review` |
| `orderService.placeOrder()` | POST | `/api/v1/checkout/place-order` |
| `orderService.getOrders()` | GET | `/api/v1/orders` |
| `orderService.getOrder(id)` | GET | `/api/v1/orders/:id` |
| `orderService.reorder(id)` | POST | `/api/v1/orders/:id/reorder` |
| `orderService.toggleFavourite(id)` | POST | `/api/v1/orders/:id/favourite` |
| `orderService.getTrackingOrders()` | GET | `/api/v1/orders/tracking/all` |
| `profileService.getAccountDetails()` | GET | `/api/v1/profile/account-details` |
| `profileService.updateAccountDetails()` | PUT | `/api/v1/profile/account-details` |
| `profileService.changePassword()` | PUT | `/api/v1/profile/change-password` |
| `profileService.getAddresses()` | GET | `/api/v1/addresses` |
| `profileService.addAddress()` | POST | `/api/v1/addresses` |
| `profileService.updateAddress(id)` | PUT | `/api/v1/addresses/:id` |
| `profileService.deleteAddress(id)` | DELETE | `/api/v1/addresses/:id` |
| `profileService.getCreditCards()` | GET | `/api/v1/payments/credit-cards` |
| `profileService.addCreditCard()` | POST | `/api/v1/payments/credit-cards` |
| `profileService.updateCreditCard(id)` | PUT | `/api/v1/payments/credit-cards/:id` |
| `profileService.deleteCreditCard(id)` | DELETE | `/api/v1/payments/credit-cards/:id` |
| `profileService.getPaymentPreference()` | GET | `/api/v1/payments/preference` |
| `profileService.updatePaymentPreference()` | PUT | `/api/v1/payments/preference` |
| `profileService.getDashboardStats()` | GET | `/api/v1/admin/dashboard/stats` |
| `profileService.getUsers()` | GET | `/api/v1/admin/users` |
| `profileService.updateUser(id)` | PUT | `/api/v1/admin/users/:id` |
| `profileService.deleteUser(id)` | DELETE | `/api/v1/admin/users/:id` |
| `productService.adminGetProducts()` | GET | `/api/v1/admin/products` |
| `productService.adminCreateProduct()` | POST | `/api/v1/admin/products` |
| `productService.adminUpdateProduct(id)` | PUT | `/api/v1/admin/products/:id` |
| `productService.adminDeleteProduct(id)` | DELETE | `/api/v1/admin/products/:id` |
| `productService.adminSyncStockFromSap()` | POST | `/api/v1/admin/products/sync-stock-from-sap` |

---

## Route Protection

| Route | Guard | Condition |
|---|---|---|
| `/login`, `/register` | `publicGuard` | Redirect to `/home` if already logged in |
| `/home`, `/cart`, `/orders`, `/profile/*`, `/wishlist` | `authGuard` | Redirect to `/login` if not logged in |
| `/admin`, `/admin/*` | `adminGuard` | Must be logged in AND role === 'admin' |
| `/products`, `/products/:id` | None | Public access |

---

## JWT Flow

1. Login → backend returns `{ access_token, refresh_token }`
2. Both stored in `localStorage`
3. `auth.interceptor.ts` attaches `Authorization: Bearer <token>` to every request
4. On 401 → automatically calls `/auth/refresh` with refresh token
5. If refresh also fails → `auth.logout()` called → redirected to `/login`
6. On app init → `AuthService.restoreSession()` checks token validity and loads user profile

---

## Key Features by Page

| Page | Features |
|---|---|
| Login | Email/mobile login, show/hide password, forgot password link |
| Register | All 5 fields, validation, password strength |
| Home (auth) | Banner, Order History CTA, Personal Details CTA, dynamic "Start Order/Continue Shopping" based on cart |
| PLP | Search bar, category/price/stock filters, sort, quantity selector, add-to-cart, wishlist, pagination |
| PDP | Image gallery with thumbnails, specs tab, description tab, rating, discount badge, quantity+add-to-cart |
| Cart Step 1 | Address dropdown (pre-selects default), payment type (invoice/card), card dropdown, cart items preview |
| Cart Step 2 | Full review: address, payment, items, notes textarea, place order |
| Cart Step 3 | Success animation, local order ID + SAP order number, SAP sync status badge |
| Order History | All/Favourites tabs, status filter chips, search, heart icon, reorder, pagination |
| Order Detail | Full item list, price breakdown, delivery address, SAP sync status, reorder |
| Order Tracking | Visual horizontal step timeline with completed/active/pending states |
| Profile | Editable form with avatar initials |
| Change Password | Current + new + confirm with mismatch validation, email trigger on save |
| Addresses | Card grid, add/edit modal, default badge, delete |
| Credit Cards | Visual card tiles with gradient background, add/edit/delete, active/expired status |
| Payment Preference | Radio buttons (invoice / credit card) with active card dropdown |
| Wishlist | Grid of saved products, remove, add to cart |
| Admin Dashboard | 6 stat cards, quick action links, SAP sync trigger |
| Admin Products | Full table with search, add/edit modal (all fields), delete |
| Admin Users | Full table with search, edit role/status modal, delete |

---

## Troubleshooting

**CORS errors in browser console**
→ Make sure FastAPI has CORS middleware allowing `http://localhost:4200`

**401 Unauthorized on all requests**
→ Check that your FastAPI auth endpoint returns `{ access_token, refresh_token, token_type }`
→ Check that the token decode in `auth.service.ts` matches your JWT payload structure

**"Cannot GET /products" on page refresh**
→ Configure your dev server to serve `index.html` for all routes (already done via Angular's dev server)
→ For production, configure nginx: `try_files $uri $uri/ /index.html`

**API calls hitting wrong URL**
→ Check `proxy.conf.json` — all `/api` calls are proxied to `:8000`
→ Make sure FastAPI routes start with `/api/v1/` or update `environment.ts`

**SAP order number not showing**
→ The backend needs to complete the SAP integration and return `sap_sales_order_number` in the order response

---

## Production Build

```bash
# Build for production
ng build --configuration production

# Output is in dist/ecommerce-angular/
# Serve with nginx, Apache, or any static server

# Example nginx config snippet:
# location / {
#   root /var/www/ecommerce;
#   try_files $uri $uri/ /index.html;
# }
# location /api {
#   proxy_pass http://localhost:8000;
# }
```

---

## Component Architecture Summary

- **Standalone components** — no NgModules needed
- **Angular Signals** — reactive state without RxJS Subject boilerplate  
- **Functional guards** — `authGuard`, `adminGuard`, `publicGuard`
- **Functional HTTP interceptor** — `authInterceptor`
- **Lazy-loaded routes** — every feature module loads on demand
- **Shared models** — single `src/app/shared/models/index.ts` with all interfaces
- **CheckoutStateService** — passes shipping data between cart steps without URL params
- **CartService** — signals for item count (used in header badge), popup control
- **ToastService** — global notification system via signals
