import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-content">
      <div class="container" style="max-width:500px">
        <h1 class="section-title">Change Password</h1>

        <div class="card">
          <p style="color:var(--text-secondary);font-size:14px;margin-bottom:24px">
            After saving, a confirmation email will be sent to your registered email address.
          </p>

          @if (successMsg()) {
            <div class="alert alert-success">{{ successMsg() }}</div>
          }
          @if (errorMsg()) {
            <div class="alert alert-danger">{{ errorMsg() }}</div>
          }

          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="form-group">
              <label class="form-label">Current Password</label>
              <div class="password-field">
                <input formControlName="current_password" [type]="show[0] ? 'text' : 'password'"
                       class="form-control" [class.error]="f['current_password'].invalid && f['current_password'].touched"
                       placeholder="Enter current password">
                <button type="button" class="pwd-toggle" (click)="show[0]=!show[0]">
                  {{ show[0] ? '🙈' : '👁️' }}
                </button>
              </div>
              @if (f['current_password'].invalid && f['current_password'].touched) {
                <span class="form-error">Current password is required</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label">New Password</label>
              <div class="password-field">
                <input formControlName="new_password" [type]="show[1] ? 'text' : 'password'"
                       class="form-control" [class.error]="f['new_password'].invalid && f['new_password'].touched"
                       placeholder="Minimum 8 characters">
                <button type="button" class="pwd-toggle" (click)="show[1]=!show[1]">{{ show[1] ? '🙈' : '👁️' }}</button>
              </div>
              @if (f['new_password'].invalid && f['new_password'].touched) {
                <span class="form-error">Password must be at least 8 characters</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Confirm New Password</label>
              <div class="password-field">
                <input formControlName="confirm_password" [type]="show[2] ? 'text' : 'password'"
                       class="form-control" [class.error]="f['confirm_password'].invalid && f['confirm_password'].touched"
                       placeholder="Re-enter new password">
                <button type="button" class="pwd-toggle" (click)="show[2]=!show[2]">{{ show[2] ? '🙈' : '👁️' }}</button>
              </div>
              @if (form.errors?.['mismatch'] && f['confirm_password'].touched) {
                <span class="form-error">Passwords do not match</span>
              }
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-ghost" (click)="form.reset()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
                @if (saving()) { <span class="spinner spinner-sm"></span> }
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .password-field { position:relative; .form-control{padding-right:44px} }
    .pwd-toggle { position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:16px; }
    .form-actions { display:flex;gap:12px;justify-content:flex-end;margin-top:8px; }
  `]
})
export class PasswordComponent {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private toast = inject(ToastService);

  show = [false, false, false];

  form = this.fb.group({
    current_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(8)]],
    confirm_password: ['', Validators.required]
  }, { validators: this.matchPasswords });

  saving = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  get f() { return this.form.controls; }

  matchPasswords(group: AbstractControl) {
    const np = group.get('new_password')?.value;
    const cp = group.get('confirm_password')?.value;
    return np === cp ? null : { mismatch: true };
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    this.profileService.changePassword({
      current_password: this.form.value.current_password!,
      new_password: this.form.value.new_password!
    }).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.form.reset();
        this.successMsg.set(res.message || 'Password updated! A confirmation email has been sent.');
        setTimeout(() => this.successMsg.set(''), 5000);
      },
      error: (e) => {
        this.saving.set(false);
        this.errorMsg.set(e.error?.detail || 'Failed to change password');
      }
    });
  }
}
