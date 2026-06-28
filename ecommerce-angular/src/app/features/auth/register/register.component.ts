import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header">
          <span class="brand-icon">🛍️</span>
          <h1>Create Account</h1>
          <p>Join ShopNow for exclusive deals</p>
        </div>

        @if (errorMsg()) {
          <div class="alert alert-danger">{{ errorMsg() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">First Name</label>
              <input formControlName="first_name" type="text" class="form-control"
                     [class.error]="f['first_name'].invalid && f['first_name'].touched"
                     placeholder="John">
              @if (f['first_name'].invalid && f['first_name'].touched) {
                <span class="form-error">Required</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Last Name</label>
              <input formControlName="last_name" type="text" class="form-control"
                     [class.error]="f['last_name'].invalid && f['last_name'].touched"
                     placeholder="Doe">
              @if (f['last_name'].invalid && f['last_name'].touched) {
                <span class="form-error">Required</span>
              }
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input formControlName="email" type="email" class="form-control"
                   [class.error]="f['email'].invalid && f['email'].touched"
                   placeholder="john@example.com">
            @if (f['email'].invalid && f['email'].touched) {
              <span class="form-error">Valid email required</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Mobile Number</label>
            <input formControlName="mobile" type="tel" class="form-control"
                   [class.error]="f['mobile'].invalid && f['mobile'].touched"
                   placeholder="+91 9876543210">
            @if (f['mobile'].invalid && f['mobile'].touched) {
              <span class="form-error">Mobile number required</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="password-field">
              <input formControlName="password" [type]="showPwd() ? 'text' : 'password'"
                     class="form-control"
                     [class.error]="f['password'].invalid && f['password'].touched"
                     placeholder="Minimum 8 characters">
              <button type="button" class="pwd-toggle" (click)="showPwd.update(v => !v)">
                {{ showPwd() ? '🙈' : '👁️' }}
              </button>
            </div>
            @if (f['password'].invalid && f['password'].touched) {
              <span class="form-error">Password must be at least 8 characters</span>
            }
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg"
                  [disabled]="form.invalid || loading()">
            @if (loading()) { <span class="spinner spinner-sm"></span> }
            Create Account
          </button>
        </form>

        <div class="divider"></div>

        <p class="auth-switch">
          Already have an account?
          <a routerLink="/login">Sign In</a>
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

    .auth-card { width: 100%; max-width: 480px; padding: 40px; }

    .auth-header { text-align: center; margin-bottom: 32px; }
    .brand-icon { font-size: 40px; display: block; margin-bottom: 12px; }
    h1 { font-size: 26px; margin-bottom: 6px; }
    p { color: var(--text-secondary); font-size: 14px; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .password-field { position: relative; .form-control { padding-right: 44px; } }
    .pwd-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px; }

    .auth-switch { text-align: center; font-size: 14px; color: var(--text-secondary); a { color: var(--accent); font-weight: 600; } }

    @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  form = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mobile: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  loading = signal(false);
  errorMsg = signal('');
  showPwd = signal(false);

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.register(this.form.value as any).subscribe({
      next: () => {
        this.toast.success('Account created! Welcome to ShopNow!');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.detail || 'Registration failed. Please try again.');
      },
      complete: () => this.loading.set(false)
    });
  }
}
