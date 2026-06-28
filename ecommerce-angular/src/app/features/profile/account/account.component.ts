import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../../core/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-content">
      <div class="container" style="max-width: 700px">
        <h1 class="section-title">Account Details</h1>

        @if (loading()) {
          <div class="loading-overlay"><div class="spinner"></div></div>
        } @else {
          <div class="card">
            <div class="profile-avatar-row">
              <div class="avatar-circle">{{ initials() }}</div>
              <div>
                <h2 style="margin-bottom:4px">{{ auth.userFullName() }}</h2>
                <p style="color:var(--text-secondary);font-size:14px">{{ auth.user()?.email }}</p>
                <span class="badge" [class]="auth.isAdmin() ? 'badge-info' : 'badge-muted'">
                  {{ auth.user()?.role | titlecase }}
                </span>
              </div>
            </div>

            <div class="divider"></div>

            @if (successMsg()) {
              <div class="alert alert-success" style="margin-bottom:20px">{{ successMsg() }}</div>
            }
            @if (errorMsg()) {
              <div class="alert alert-danger" style="margin-bottom:20px">{{ errorMsg() }}</div>
            }

            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">First Name</label>
                  <input formControlName="first_name" type="text" class="form-control"
                         [class.error]="f['first_name'].invalid && f['first_name'].touched">
                  @if (f['first_name'].invalid && f['first_name'].touched) {
                    <span class="form-error">Required</span>
                  }
                </div>
                <div class="form-group">
                  <label class="form-label">Last Name</label>
                  <input formControlName="last_name" type="text" class="form-control"
                         [class.error]="f['last_name'].invalid && f['last_name'].touched">
                  @if (f['last_name'].invalid && f['last_name'].touched) {
                    <span class="form-error">Required</span>
                  }
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input formControlName="email" type="email" class="form-control"
                       [class.error]="f['email'].invalid && f['email'].touched">
                @if (f['email'].invalid && f['email'].touched) {
                  <span class="form-error">Valid email required</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label">Mobile Number</label>
                <input formControlName="mobile" type="tel" class="form-control">
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-ghost" (click)="cancel()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
                  @if (saving()) { <span class="spinner spinner-sm"></span> }
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .profile-avatar-row { display:flex;gap:20px;align-items:center;margin-bottom:20px; }
    .avatar-circle { width:72px;height:72px;border-radius:50%;background:var(--accent);color:white;font-size:26px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .form-row { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
    .form-actions { display:flex;gap:12px;justify-content:flex-end;margin-top:8px; }
    @media(max-width:600px){.form-row{grid-template-columns:1fr}}
  `]
})
export class AccountComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  form = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mobile: ['']
  });

  loading = signal(true);
  saving = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  get f() { return this.form.controls; }

  initials = () => {
    const u = this.auth.user();
    return u ? `${u.first_name[0]}${u.last_name[0]}`.toUpperCase() : '?';
  };

  ngOnInit(): void {
    this.profileService.getAccountDetails().subscribe({
      next: user => {
        this.form.patchValue(user as any);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Failed to load profile'); }
    });
  }

  cancel(): void {
    const u = this.auth.user();
    if (u) this.form.patchValue(u as any);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    this.profileService.updateAccountDetails(this.form.value as any).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMsg.set('Profile updated successfully!');
        setTimeout(() => this.successMsg.set(''), 4000);
      },
      error: (e) => {
        this.saving.set(false);
        this.errorMsg.set(e.error?.detail || 'Failed to update profile');
      }
    });
  }
}
