import { Routes } from '@angular/router';
import { authGuard, adminGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Public routes
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/login/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/login/reset-password.component').then(m => m.ResetPasswordComponent)
  },

  // Products (public)
  {
    path: 'products',
    loadComponent: () => import('./features/products/plp/plp.component').then(m => m.PlpComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/pdp/pdp.component').then(m => m.PdpComponent)
  },

  // Auth-required routes
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () => import('./features/cart/cart-shell.component').then(m => m.CartShellComponent),
    children: [
      { path: '', redirectTo: 'shipping', pathMatch: 'full' },
      {
        path: 'shipping',
        loadComponent: () => import('./features/cart/shipping/shipping.component').then(m => m.ShippingComponent)
      },
      {
        path: 'review',
        loadComponent: () => import('./features/cart/review/review.component').then(m => m.ReviewComponent)
      },
      {
        path: 'confirmation',
        loadComponent: () => import('./features/cart/confirmation/confirmation.component').then(m => m.ConfirmationComponent)
      }
    ]
  },
  {
    path: 'wishlist',
    canActivate: [authGuard],
    loadComponent: () => import('./features/wishlist/wishlist.component').then(m => m.WishlistComponent)
  },

  // Profile / My Account
  {
    path: 'profile',
    canActivate: [authGuard],
    children: [
      {
        path: 'account-details',
        loadComponent: () => import('./features/profile/account/account.component').then(m => m.AccountComponent)
      },
      {
        path: 'change-password',
        loadComponent: () => import('./features/profile/password/password.component').then(m => m.PasswordComponent)
      },
      {
        path: 'addresses',
        loadComponent: () => import('./features/profile/addresses/addresses.component').then(m => m.AddressesComponent)
      },
      {
        path: 'payments/credit-cards',
        loadComponent: () => import('./features/profile/payments/credit-cards/credit-cards.component').then(m => m.CreditCardsComponent)
      },
      {
        path: 'payments/preference',
        loadComponent: () => import('./features/profile/payments/preference/preference.component').then(m => m.PreferenceComponent)
      }
    ]
  },

  // Orders
  {
    path: 'orders',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/orders/history/order-history.component').then(m => m.OrderHistoryComponent)
      },
      {
        path: 'tracking',
        loadComponent: () => import('./features/orders/tracking/order-tracking.component').then(m => m.OrderTrackingComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/orders/detail/order-detail.component').then(m => m.OrderDetailComponent)
      }
    ]
  },

  // Admin
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/products/admin-products.component').then(m => m.AdminProductsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent)
      }
    ]
  },

  // 404
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found.component').then(m => m.NotFoundComponent)
  }
];
