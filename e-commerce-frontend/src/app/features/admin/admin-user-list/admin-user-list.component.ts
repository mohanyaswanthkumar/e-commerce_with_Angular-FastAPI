import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminUserService } from '../../../core/services/admin-user.service';
import { AdminUser } from '../../../core/models/admin-user.model';
import { NotificationService } from '../../../core/services/notification.service';

/** Admin user management list: role, active status, and a Deactivate action. */
@Component({
  selector: 'app-admin-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-user-list.component.html',
  styleUrl: './admin-user-list.component.scss',
})
export class AdminUserListComponent implements OnInit {
  readonly users = signal<AdminUser[]>([]);
  readonly isLoading = signal(true);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = 20;
  readonly deactivatingId = signal<number | null>(null);

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total() / this.pageSize));
  }

  constructor(
    private readonly adminUserService: AdminUserService,
    private readonly notifications: NotificationService,
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  private fetch(): void {
    this.isLoading.set(true);
    this.adminUserService.list(this.page(), this.pageSize).subscribe({
      next: (res) => {
        this.users.set(res.items);
        this.total.set(res.total);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.page.set(page);
    this.fetch();
  }

  deactivateUser(user: AdminUser): void {
    if (!confirm(`Deactivate ${user.first_name} ${user.last_name}? They won't be able to log in.`)) return;

    this.deactivatingId.set(user.id);
    this.adminUserService.deactivate(user.id).subscribe({
      next: () => {
        this.users.update((list) =>
          list.map((u) => (u.id === user.id ? { ...u, is_active: false } : u)),
        );
        this.deactivatingId.set(null);
        this.notifications.showSuccess('User deactivated.');
      },
      error: () => this.deactivatingId.set(null),
    });
  }
}