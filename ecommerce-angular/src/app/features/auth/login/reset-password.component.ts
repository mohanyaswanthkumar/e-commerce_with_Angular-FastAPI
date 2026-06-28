import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header">
          <span class="brand-icon">🔒</span>
          <h1>New Password</h1>
          <p>Enter your new password below</p>
        </div>

        @if (success()) {
          <div class="alert alert-success">Password updated successfully!</div>
          <a routerLink="/login" class="btn btn-primary btn-full">Sign In</a>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()">
            @if (error()) { <div class="alert alert-danger">{{ error() }}</div> }
            <div class="form-group">
              <label class="form-label">New Password</label>
              <input formControlName="new_password" type="password" class="form-control" placeholder="Minimum 8 characters">
            </div>
            <button type="submit" class="btn btn-primary btn-full" [disabled]="form.invalid || loading()">
              @if (loading()) { <span class="spinner spinner-sm"></span> }
              Reset Password
            </button>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: calc(100vh - 72px - 80px); display: flex; align-items: center; justify-content: center; padding: 40px 16px; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%); }
    .auth-card { width: 100%; max-width: 420px; padding: 40px; }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .brand-icon { font-size: 40px; display: block; margin-bottom: 12px; }
    h1 { font-size: 26px; margin-bottom: 6px; }
    p { color: var(--text-secondary); font-size: 14px; }
  `]
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  form = this.fb.group({ new_password: ['', [Validators.required, Validators.minLength(8)]] });
  loading = signal(false);
  success = signal(false);
  error = signal('');

  submit(): void {
    const token = this.route.snapshot.queryParams['token'];
    if (!token) { this.error.set('Invalid or missing reset token'); return; }
    this.loading.set(true);
    this.auth.resetPassword(token, this.form.value.new_password!).subscribe({
      next: () => this.success.set(true),
      error: (e) => { this.error.set(e.error?.detail || 'Failed to reset password'); this.loading.set(false); },
      complete: () => this.loading.set(false)
    });
  }
}
