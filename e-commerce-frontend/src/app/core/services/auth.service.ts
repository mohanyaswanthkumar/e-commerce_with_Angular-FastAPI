import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiEndpoints } from '../constants/api-endpoints';
import {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  TokenResponse,
  User,
} from '../models/user.model';
import { TokenStorageService } from './token-storage.service';

/**
 * Central auth state. Header (unauth vs auth vs "Hi Customer" dropdown),
 * route guards, and the interceptor all read from this single service so
 * there is one source of truth for authentication state.
 *
 * JWT contains:
 * { sub, role, type, iat, exp }
 *
 * Since it doesn't contain the user's profile information,
 * we fetch /profile/account-details after login and on app startup
 * when a valid token already exists.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly currentUserSig = signal<User | null>(null);

  /**
   * Holds the user's role extracted from the JWT.
   * This is the reactive source of truth for authentication state.
   */
  private readonly roleFromTokenSig = signal<string | null>(
    this.restoreRoleFromToken()
  );

  readonly currentUser = computed(() => this.currentUserSig());

  /**
   * IMPORTANT:
   * Always read roleFromTokenSig() so Angular registers it
   * as a dependency.
   *
   * Avoid:
   * tokenStorage.hasToken() && roleFromTokenSig()
   * because && short-circuiting prevents dependency tracking.
   */
  readonly isAuthenticated = computed(() => {
    const role = this.roleFromTokenSig(); // Always tracked

    if (!this.tokenStorage.hasToken()) {
      return false;
    }

    return role !== null;
  });

  readonly isAdmin = computed(
    () => this.roleFromTokenSig() === 'admin'
  );

  constructor(
    private readonly http: HttpClient,
    private readonly tokenStorage: TokenStorageService,
  ) {
    if (this.isAuthenticated()) {
      this.loadCurrentUser().subscribe();
    }
  }

  register(payload: RegisterRequest): Observable<User> {
    return this.http.post<User>(
      ApiEndpoints.auth.register,
      payload
    );
  }

  login(payload: LoginRequest): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(
        ApiEndpoints.auth.login,
        payload
      )
      .pipe(
        tap((tokens) => this.persistSession(tokens))
      );
  }

  loadCurrentUser(): Observable<User> {
    return this.http
      .get<User>(ApiEndpoints.profile.accountDetails)
      .pipe(
        tap((user) => this.currentUserSig.set(user))
      );
  }

  refreshToken(): Observable<TokenResponse> {
    const refresh_token =
      this.tokenStorage.getRefreshToken() ?? '';

    return this.http
      .post<TokenResponse>(
        ApiEndpoints.auth.refresh,
        { refresh_token }
      )
      .pipe(
        tap((tokens) => this.persistSession(tokens))
      );
  }

  forgotPassword(
    payload: ForgotPasswordRequest
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      ApiEndpoints.auth.forgotPassword,
      payload
    );
  }

  resetPassword(
    payload: ResetPasswordRequest
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      ApiEndpoints.auth.resetPassword,
      payload
    );
  }

  logout(): void {
    this.tokenStorage.clear();
    this.currentUserSig.set(null);
    this.roleFromTokenSig.set(null);
  }

  /**
   * Saves tokens, updates authentication state,
   * then loads the user's profile.
   */
  private persistSession(tokens: TokenResponse): void {
    this.tokenStorage.saveTokens(
      tokens.access_token,
      tokens.refresh_token
    );

    const decoded = this.tokenStorage.decodeToken(
      tokens.access_token
    );

    this.roleFromTokenSig.set(
      decoded?.['role'] ?? null
    );

    this.loadCurrentUser().subscribe();
  }

  /**
   * Restores the user's role from a persisted JWT
   * when the application starts.
   */
  private restoreRoleFromToken(): string | null {
    const token = this.tokenStorage.getAccessToken();

    if (!token || this.tokenStorage.isTokenExpired(token)) {
      return null;
    }

    return (
      this.tokenStorage.decodeToken(token)?.['role'] ??
      null
    );
  }
}