/**
 * Single source of truth for backend routes.
 * Mirrors app/main.py -> API_V1_PREFIX + each router's prefix exactly,
 * so path drift between Angular and FastAPI is caught at compile time.
 * environment.apiBaseUrl already includes the /api/v1 prefix.
 */
import { environment } from '../../../environments/environment';

const BASE = environment.apiBaseUrl;

export const ApiEndpoints = {
  auth: {
    register: `${BASE}/auth/register`,
    login: `${BASE}/auth/login`,
    refresh: `${BASE}/auth/refresh`,
    forgotPassword: `${BASE}/auth/forgot-password`,
    resetPassword: `${BASE}/auth/reset-password`,
  },
  products: {
    plp: `${BASE}/products`,
    pdp: (productId: number | string) => `${BASE}/products/${productId}`,
    wishlist: (productId: number | string) => `${BASE}/products/${productId}/wishlist`,
  },
  cart: {
    get: `${BASE}/cart`,
    addItem: `${BASE}/cart/items`,
    updateItem: (itemId: number | string) => `${BASE}/cart/items/${itemId}`,
    removeItem: (itemId: number | string) => `${BASE}/cart/items/${itemId}`,
  },
  checkout: {
    shippingBilling: `${BASE}/checkout/shipping-billing`,
    review: `${BASE}/checkout/review`,
    placeOrder: `${BASE}/checkout/place-order`,
  },
  orders: {
    confirmation: (orderId: number | string) => `${BASE}/orders/${orderId}/confirmation`,
    history: `${BASE}/orders`,
    detail: (orderId: number | string) => `${BASE}/orders/${orderId}`,
    favourite: (orderId: number | string) => `${BASE}/orders/${orderId}/favourite`,
    reorder: (orderId: number | string) => `${BASE}/orders/${orderId}/reorder`,
    trackingAll: `${BASE}/orders/tracking/all`,
    sapRetry: (orderId: number | string) => `${BASE}/orders/${orderId}/sap-retry`,
  },
  profile: {
    accountDetails: `${BASE}/profile/account-details`,
    changePassword: `${BASE}/profile/change-password`,
  },
  addresses: {
    list: `${BASE}/addresses`,
    create: `${BASE}/addresses`,
    update: (addressId: number | string) => `${BASE}/addresses/${addressId}`,
    delete: (addressId: number | string) => `${BASE}/addresses/${addressId}`,
  },
  payments: {
    creditCards: `${BASE}/payments/credit-cards`,
    creditCard: (cardId: number | string) => `${BASE}/payments/credit-cards/${cardId}`,
    preference: `${BASE}/payments/preference`,
  },
  admin: {
    products: `${BASE}/admin/products`,
    product: (productId: number | string) => `${BASE}/admin/products/${productId}`,
    syncStockFromSap: `${BASE}/admin/products/sync-stock-from-sap`,
    users: `${BASE}/admin/users`,
    user: (userId: number | string) => `${BASE}/admin/users/${userId}`,
  },
};
