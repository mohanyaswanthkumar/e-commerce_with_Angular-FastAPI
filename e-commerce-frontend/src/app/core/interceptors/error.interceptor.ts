import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { NotificationService } from '../services/notification.service';

/**
 * Central place to surface backend error messages.
 * Matches app/main.py's exception shape:
 *   - Validation errors -> { detail: [...], message: "Validation failed" }
 *   - SAP errors (502/503) -> { message, detail }
 *   - Everything else -> { message } or { detail } (FastAPI's default HTTPException shape)
 * Auth-related 401s are already handled by auth.interceptor.ts, so this stays generic.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) {
        const message = extractMessage(err);
        notifications.showError(message);
      }
      return throwError(() => err);
    }),
  );
};

function extractMessage(err: HttpErrorResponse): string {
  const body = err.error;
  if (typeof body === 'string') return body;
  if (body?.message) return body.message;
  if (typeof body?.detail === 'string') return body.detail;
  if (Array.isArray(body?.detail) && body.detail.length) {
    const first = body.detail[0];
    return first?.msg ?? 'Something went wrong. Please try again.';
  }
  return err.status === 0
    ? 'Unable to reach the server. Please check your connection.'
    : 'Something went wrong. Please try again.';
}
