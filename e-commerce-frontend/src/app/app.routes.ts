import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';

/**
 * Phase 0: home, login, register.
 * Phase 1: PLP/PDP, the 3-step cart/checkout flow, order history, order
 * detail, and track-my-order.
 * Phase 2 (this update): profile, addresses, payments.
 * Still to come: admin dashboard, wishlist listing page.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'ShopEase — Home',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Login — ShopEase',
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
    title: 'Register — ShopEase',
  },
  {
    // PLP is guest-accessible per app/routers/product_router.py (get_optional_user) —
    // no authGuard here. "Add to cart" / wishlist inside the component redirect
    // to /login only when clicked, with a returnUrl back to this page.
    path: 'products',
    loadComponent: () => import('./features/plp/plp.component').then((m) => m.PlpComponent),
    title: 'Products — ShopEase',
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/pdp/pdp.component').then((m) => m.PdpComponent),
    title: 'Product details — ShopEase',
  },
  {
    // All 3 checkout steps require login -> guarded once here, not per-step.
    path: 'cart',
    canActivate: [authGuard],
    loadChildren: () => import('./features/cart/cart.routes').then((m) => m.cartRoutes),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/order-history/order-history.component').then((m) => m.OrderHistoryComponent),
    title: 'Order history — ShopEase',
  },
  {
    // Must be registered BEFORE 'orders/:id' — otherwise 'tracking' would match as an :id.
    path: 'orders/tracking',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/track-order/track-order.component').then((m) => m.TrackOrderComponent),
    title: 'Track my order — ShopEase',
  },
  {
    path: 'orders/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/order-detail/order-detail.component').then((m) => m.OrderDetailComponent),
    title: 'Order details — ShopEase',
  },

  // ---- Phase 2 (this update): profile, addresses, payments ----
  {
    path: 'profile/account-details',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/account-details/account-details.component').then((m) => m.AccountDetailsComponent),
    title: 'Account details — ShopEase',
  },
  {
    path: 'profile/change-password',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/change-password/change-password.component').then((m) => m.ChangePasswordComponent),
    title: 'Change password — ShopEase',
  },
  {
    path: 'addresses',
    canActivate: [authGuard],
    loadComponent: () => import('./features/addresses/address-list/address-list.component').then((m) => m.AddressListComponent),
    title: 'Addresses — ShopEase',
  },
  {
    // Must be registered BEFORE 'addresses/:id/edit' — otherwise 'new' would match as an :id.
    path: 'addresses/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/addresses/address-form/address-form.component').then((m) => m.AddressFormComponent),
    title: 'Add address — ShopEase',
  },
  {
    path: 'addresses/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./features/addresses/address-form/address-form.component').then((m) => m.AddressFormComponent),
    title: 'Edit address — ShopEase',
  },
  {
    path: 'payments/credit-cards',
    canActivate: [authGuard],
    loadComponent: () => import('./features/payments/credit-cards/credit-cards.component').then((m) => m.CreditCardsComponent),
    title: 'Credit cards — ShopEase',
  },
  {
    // Must be registered BEFORE 'payments/credit-cards/:id/edit'.
    path: 'payments/credit-cards/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/payments/credit-card-form/credit-card-form.component').then((m) => m.CreditCardFormComponent),
    title: 'Add card — ShopEase',
  },
  {
    path: 'payments/credit-cards/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./features/payments/credit-card-form/credit-card-form.component').then((m) => m.CreditCardFormComponent),
    title: 'Edit card — ShopEase',
  },
  {
    path: 'payments/preference',
    canActivate: [authGuard],
    loadComponent: () => import('./features/payments/payment-preference/payment-preference.component').then((m) => m.PaymentPreferenceComponent),
    title: 'Payment preference — ShopEase',
  },

 {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },

  { path: '**', redirectTo: '' },
];