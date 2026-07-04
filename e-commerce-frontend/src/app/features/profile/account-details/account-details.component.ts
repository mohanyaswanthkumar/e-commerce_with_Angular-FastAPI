import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProfileService } from '../../../core/services/profile.service';
import { User } from '../../../core/models/user.model';

/** Account details page: all details in editable format, with Cancel and Save CTAs. */
@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-details.component.html',
  styleUrl: './account-details.component.scss',
})
export class AccountDetailsComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly isEditing = signal(false);
  private originalUser: User | null = null;

  readonly form = this.fb.nonNullable.group({
    first_name: ['', [Validators.required, Validators.maxLength(100)]],
    last_name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    mobile_number: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
    private readonly notifications: NotificationService,
  ) {}

  ngOnInit(): void {
    this.form.disable();
    this.profileService.getAccountDetails().subscribe({
      next: (user) => {
        this.originalUser = user;
        this.form.patchValue(user);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  edit(): void {
    this.isEditing.set(true);
    this.form.enable();
  }

  cancel(): void {
    this.isEditing.set(false);
    this.form.disable();
    if (this.originalUser) this.form.patchValue(this.originalUser);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.profileService.updateAccountDetails(this.form.getRawValue()).subscribe({
      next: (user) => {
        this.originalUser = user;
        this.isSaving.set(false);
        this.isEditing.set(false);
        this.form.disable();
        this.notifications.showSuccess('Account details updated.');
        // Refresh the shared AuthService.currentUser so the header's
        // "Hi, <first name>" reflects the change immediately.
        this.authService.loadCurrentUser().subscribe();
      },
      error: () => this.isSaving.set(false),
    });
  }
}