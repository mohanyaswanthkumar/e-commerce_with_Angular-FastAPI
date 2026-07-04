import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NotificationService } from '../../../core/services/notification.service';
import { ProfileService } from '../../../core/services/profile.service';

/**
 * Password change page: current password + new password, Cancel/Save CTAs.
 * Backend sends a confirmation email after a successful save
 * (see app/services/profile_service.py::change_password).
 */
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    current_password: ['', [Validators.required]],
    new_password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
    confirm_password: ['', [Validators.required]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly profileService: ProfileService,
    private readonly notifications: NotificationService,
    private readonly router: Router,
  ) {}

  get passwordsMismatch(): boolean {
    const { new_password, confirm_password } = this.form.value;
    return !!confirm_password && new_password !== confirm_password;
  }

  cancel(): void {
    this.router.navigate(['/']);
  }

  save(): void {
    this.errorMessage.set(null);

    if (this.form.invalid || this.passwordsMismatch) {
      this.form.markAllAsTouched();
      if (this.passwordsMismatch) this.errorMessage.set('New password and confirmation do not match.');
      return;
    }

    this.isSaving.set(true);
    this.profileService
      .changePassword({
        current_password: this.form.value.current_password!,
        new_password: this.form.value.new_password!,
      })
      .subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.notifications.showSuccess(res.message);
          this.form.reset();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(
            typeof err?.error?.detail === 'string' ? err.error.detail : 'Could not change password. Check your current password and try again.',
          );
        },
      });
  }
}