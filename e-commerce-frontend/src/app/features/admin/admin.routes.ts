import { Routes } from '@angular/router';

/**
 * All /admin/* pages, nested under AdminLayoutComponent's sidebar shell.
 * adminGuard is applied once where this is mounted in app.routes.ts.
 */
export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      {
        path: 'products',
        loadComponent: () =>
          import('./admin-product-list/admin-product-list.component').then((m) => m.AdminProductListComponent),
        title: 'Admin — Products',
      },
      {
        // Must be registered BEFORE 'products/:id/edit' — otherwise 'new' would match as an :id.
        path: 'products/new',
        loadComponent: () =>
          import('./admin-product-form/admin-product-form.component').then((m) => m.AdminProductFormComponent),
        title: 'Admin — Add product',
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./admin-product-form/admin-product-form.component').then((m) => m.AdminProductFormComponent),
        title: 'Admin — Edit product',
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin-user-list/admin-user-list.component').then((m) => m.AdminUserListComponent),
        title: 'Admin — Users',
      },
      {
        path: 'users/:id/edit',
        loadComponent: () =>
          import('./admin-user-form/admin-user-form.component').then((m) => m.AdminUserFormComponent),
        title: 'Admin — Edit user',
      },
    ],
  },
];