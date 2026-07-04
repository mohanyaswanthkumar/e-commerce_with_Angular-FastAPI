import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * URL-based restriction (frontend side) matching the backend's centralized
 * Depends(get_current_user) rule from app/main.py's docstring:
 *   /cart*, /profile*, /addresses*, /payments*, /orders*, /checkout* -> requires JWT.
 * This guard is the single place those routes are gated; apply it at the
 * route-config level (see app.routes.ts), not per-component.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) return true;

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
