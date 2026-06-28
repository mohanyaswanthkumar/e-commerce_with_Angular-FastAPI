import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest, RegisterRequest, AuthResponse,
  User, TokenPayload
} from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_KEY = 'refresh_token';
  private readonly api = environment.apiUrl;

  // reactive state
  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly userFullName = computed(() => {
    const u = this._user();
    return u ? `${u.first_name} ${u.last_name}` : '';
  });

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/login`, payload).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/register`, payload).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refresh = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.api}/auth/refresh`, { refresh_token: refresh }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.access_token);
        if (res.refresh_token) localStorage.setItem(this.REFRESH_KEY, res.refresh_token);
      })
    );
  }

  forgotPassword(identifier: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.api}/auth/forgot-password`, { identifier });
  }

  resetPassword(token: string, new_password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.api}/auth/reset-password`, { token, new_password });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = this.decodeToken(token);
      return Date.now() / 1000 > payload.exp;
    } catch {
      return true;
    }
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.access_token);
    if (res.refresh_token) localStorage.setItem(this.REFRESH_KEY, res.refresh_token);
    this.loadUserFromToken(res.access_token);
  }

  private restoreSession(): void {
    const token = this.getToken();
    if (token && !this.isTokenExpired()) {
      this.loadUserFromToken(token);
    } else if (token) {
      // try refresh
      const refresh = this.getRefreshToken();
      if (refresh) {
        this.refreshToken().subscribe({
          error: () => this.logout()
        });
      } else {
        this.logout();
      }
    }
  }

  private loadUserFromToken(token: string): void {
    try {
      const payload = this.decodeToken(token);
      // fetch full user profile
      this.http.get<User>(`${this.api}/profile/account-details`).subscribe({
        next: user => this._user.set(user),
        error: () => this._user.set(null)
      });
    } catch {
      this._user.set(null);
    }
  }

  private decodeToken(token: string): TokenPayload {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  }
}
