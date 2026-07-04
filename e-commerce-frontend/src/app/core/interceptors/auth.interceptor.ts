import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

/**
 * Functional interceptor (Angular 17 style, registered via provideHttpClient
 * (withInterceptors([...])) in app.config.ts):
 *  1. Attaches `Authorization: Bearer <token>` from localStorage to every
 *     request that targets our own API (never to third-party URLs).
 *  2. On a 401, tries exactly one silent refresh via /auth/refresh before
 *     giving up and forcing logout + redirect to /login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register')
    || req.url.includes('/auth/refresh');

  const accessToken = tokenStorage.getAccessToken();
  const authorizedReq = accessToken && !isAuthRequest
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authorizedReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isAuthRequest && tokenStorage.getRefreshToken()) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            const retriedReq = req.clone({
              setHeaders: { Authorization: `Bearer ${tokenStorage.getAccessToken()}` },
            });
            return next(retriedReq);
          }),
          catchError((refreshErr) => {
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshErr);
          }),
        );
      }
      if (err.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
