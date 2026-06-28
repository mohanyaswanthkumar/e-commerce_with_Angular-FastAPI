import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header">
          <span class="brand-icon">🔑</span>
          <h1>Reset Password</h1>
          <p>Enter your email to receive a reset link</p>
        </div>

        @if (success()) {
          <div class="alert alert-success">
            ✅ Password reset email sent! Check your inbox.
          </div>
          <a routerLink="/login" class="btn btn-primary btn-full">Back to Login</a>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()">
            @if (error()) {
              <div class="alert alert-danger">{{ error() }}</div>
            }
            <div class="form-group">
              <label class="form-label">Email / Mobile</label>
              <input formControlName="identifier" type="text" class="form-control" placeholder="Enter your email or mobile">
            </div>
            <button type="submit" class="btn btn-primary btn-full" [disabled]="form.invalid || loading()">
              @if (loading()) { <span class="spinner spinner-sm"></span> }
              Send Reset Link
            </button>
          </form>
          <p class="auth-switch">
            Remember your password? <a routerLink="/login">Sign In</a>
          </p>
        }
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
    .auth-card { width: 100%; max-width: 420px; padding: 40px; }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .brand-icon { font-size: 40px; display: block; margin-bottom: 12px; }
    h1 { font-size: 26px; margin-bottom: 6px; }
    p { color: var(--text-secondary); font-size: 14px; }
    .auth-switch { text-align: center; font-size: 14px; margin-top: 20px; color: var(--text-secondary); a { color: var(--accent); font-weight: 600; } }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  form = this.fb.group({ identifier: ['', Validators.required] });
  loading = signal(false);
  success = signal(false);
  error = signal('');

  submit(): void {
    this.loading.set(true);
    this.auth.forgotPassword(this.form.value.identifier!).subscribe({
      next: () => this.success.set(true),
      error: (e) => { this.error.set(e.error?.detail || 'Failed to send reset email'); this.loading.set(false); },
      complete: () => this.loading.set(false)
    });
  }
}
