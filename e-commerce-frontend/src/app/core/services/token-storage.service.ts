import { Injectable } from '@angular/core';

const ACCESS_TOKEN_KEY = 'ec_access_token';
const REFRESH_TOKEN_KEY = 'ec_refresh_token';

/**
 * Wraps localStorage access for the JWT pair.
 * Per requirement: "after login, jwt token should store in localstorage of frontend."
 * Kept as its own service (rather than inlined in AuthService) so swapping the
 * storage strategy later (e.g. httpOnly cookie) only touches this one file.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Decodes the JWT payload without any external dependency.
   * Only used for lightweight UI decisions (role, exp) — the backend
   * remains the source of truth for authorization on every request.
   */
  decodeToken(token: string): Record<string, any> | null {
    try {
      const payload = token.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = decodeURIComponent(
        atob(normalized)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded?.['exp']) return true;
    return Date.now() >= decoded['exp'] * 1000;
  }
}
