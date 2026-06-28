import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header">
          <span class="brand-icon">🛍️</span>
          <h1>Welcome Back</h1>
          <p>Sign in to your ShopNow account</p>
        </div>

        @if (errorMsg()) {
          <div class="alert alert-danger">{{ errorMsg() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label class="form-label">Email or Mobile Number</label>
            <input formControlName="identifier" type="text" class="form-control"
                   [class.error]="f['identifier'].invalid && f['identifier'].touched"
                   placeholder="Enter email or mobile">
            @if (f['identifier'].invalid && f['identifier'].touched) {
              <span class="form-error">Email or mobile is required</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="password-field">
              <input formControlName="password" [type]="showPwd() ? 'text' : 'password'"
                     class="form-control"
                     [class.error]="f['password'].invalid && f['password'].touched"
                     placeholder="Enter your password">
              <button type="button" class="pwd-toggle" (click)="showPwd.update(v => !v)">
                {{ showPwd() ? '🙈' : '👁️' }}
              </button>
            </div>
            @if (f['password'].invalid && f['password'].touched) {
              <span class="form-error">Password is required</span>
            }
          </div>

          <div class="forgot-row">
            <a routerLink="/forgot-password" class="forgot-link">Forgot Password?</a>
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg"
                  [disabled]="form.invalid || loading()">
            @if (loading()) { <span class="spinner spinner-sm"></span> }
            Sign In
          </button>
        </form>

        <div class="divider"></div>

        <p class="auth-switch">
          Don't have an account?
          <a routerLink="/register">Create Account</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 72px - 80px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 16px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 40px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 32px;

      .brand-icon { font-size: 40px; display: block; margin-bottom: 12px; }
      h1 { font-size: 26px; margin-bottom: 6px; }
      p { color: var(--text-secondary); font-size: 14px; }
    }

    .password-field {
      position: relative;
      .form-control { padding-right: 44px; }
    }

    .pwd-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
    }

    .forgot-row {
      text-align: right;
      margin-bottom: 20px;
      margin-top: -8px;
    }

    .forgot-link {
      font-size: 13px;
      color: var(--accent);
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }

    .auth-switch {
      text-align: center;
      font-size: 14px;
      color: var(--text-secondary);
      a { color: var(--accent); font-weight: 600; }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required]
  });

  loading = signal(false);
  errorMsg = signal('');
  showPwd = signal(false);

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.form.value as any).subscribe({
      next: () => {
        this.toast.success('Welcome back!');
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.detail || 'Invalid credentials. Please try again.');
      },
      complete: () => this.loading.set(false)
    });
  }
}
