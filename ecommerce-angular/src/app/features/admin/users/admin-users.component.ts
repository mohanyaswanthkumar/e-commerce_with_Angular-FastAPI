import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdminUserResponse, AdminUserUpdateRequest } from '../../../shared/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private toast = inject(ToastService);

  users = signal<AdminUserResponse[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  editingUser = signal<AdminUserResponse | null>(null);
  deleting: Record<number, boolean> = {};

  searchTerm = '';
  searchTimeout?: ReturnType<typeof setTimeout>;
  page = signal(1);
  total = signal(0);
  pageSize = 15;
  totalPages = () => Math.ceil(this.total() / this.pageSize);

  form = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mobile: [''],
    role: ['customer', Validators.required],
    is_active: [true]
  });

  roles = ['customer', 'admin', 'manager'];

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading.set(true);
    this.profileService.getUsers({
      search: this.searchTerm || undefined,
      page: this.page(),
      page_size: this.pageSize
    }).subscribe({
      next: res => { this.users.set(res.items); this.total.set(res.total); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load users'); }
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => { this.page.set(1); this.loadUsers(); }, 400);
  }

  openEdit(user: AdminUserResponse): void {
    this.editingUser.set(user);
    this.form.patchValue(user as any);
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); this.editingUser.set(null); }

  save(): void {
    if (this.form.invalid || !this.editingUser()) return;
    this.saving.set(true);
    const req: AdminUserUpdateRequest = this.form.value as any;
    this.profileService.updateUser(this.editingUser()!.id, req).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.loadUsers();
        this.toast.success('User updated!');
      },
      error: (e) => { this.saving.set(false); this.toast.error(e.error?.detail || 'Update failed'); }
    });
  }

  deleteUser(id: number): void {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return;
    this.deleting[id] = true;
    this.profileService.deleteUser(id).subscribe({
      next: () => { this.deleting[id] = false; this.loadUsers(); this.toast.success('User deleted'); },
      error: (e) => { this.deleting[id] = false; this.toast.error(e.error?.detail || 'Delete failed'); }
    });
  }

  goToPage(p: number): void { this.page.set(p); this.loadUsers(); }

  pageNums(): number[] {
    const arr: number[] = [];
    for (let i = Math.max(1, this.page() - 2); i <= Math.min(this.totalPages(), this.page() + 2); i++) arr.push(i);
    return arr;
  }

  roleBadge(role: string): string {
    return { admin: 'badge badge-danger', manager: 'badge badge-info', customer: 'badge badge-muted' }[role] ?? 'badge badge-muted';
  }
}
