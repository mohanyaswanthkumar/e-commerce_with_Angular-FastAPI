import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AdminUserService } from '../../../core/services/admin-user.service';
import { NotificationService } from '../../../core/services/notification.service';

/**
 * Admin edit-user form (no add-user here — accounts are created via
 * self-service Register). Lets an admin change name/email/mobile, role, and
 * active status per app/admin/schemas.py::AdminUserUpdate — note the backend
 * deliberately never exposes the password hash here (privacy control).
 */
@Component({
  selector: 'app-admin-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-user-form.component.html',
  styleUrl: './admin-user-form.component.scss',
})
export class AdminUserFormComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  private userId!: number;

  readonly form = this.fb.nonNullable.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    mobile_number: ['', [Validators.required]],
    role: ['customer' as 'customer' | 'admin', [Validators.required]],
    is_active: [true],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminUserService: AdminUserService,
    private readonly notifications: NotificationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.adminUserService.get(this.userId).subscribe({
      next: (user) => {
        this.form.patchValue(user);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.adminUserService.update(this.userId, this.form.getRawValue() as any).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.notifications.showSuccess('User updated.');
        this.router.navigate(['/admin/users']);
      },
      error: () => this.isSaving.set(false),
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/users']);
  }
}