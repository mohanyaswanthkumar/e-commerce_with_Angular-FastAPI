import { Routes } from '@angular/router';

/**
 * Cart page's 3 sections, each its own route/page as per spec, all under
 * the authGuard applied once where this is mounted in app.routes.ts.
 * '/cart' itself redirects straight to Step 1.
 */
export const cartRoutes: Routes = [
  { path: '', redirectTo: 'shipping-billing', pathMatch: 'full' },
  {
    path: 'shipping-billing',
    loadComponent: () =>
      import('./shipping-billing/shipping-billing.component').then((m) => m.ShippingBillingComponent),
    title: 'Shipping & Billing — ShopEase',
  },
  {
    path: 'review',
    loadComponent: () =>
      import('./order-review/order-review.component').then((m) => m.OrderReviewComponent),
    title: 'Order Review — ShopEase',
  },
  {
    path: 'confirmation/:orderId',
    loadComponent: () =>
      import('./order-confirmation/order-confirmation.component').then((m) => m.OrderConfirmationComponent),
    title: 'Order Confirmation — ShopEase',
  },
];
