import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiEndpoints } from '../constants/api-endpoints';
import { AdminUser, AdminUserListResponse, AdminUserUpdate } from '../models/admin-user.model';

/** Mirrors the User Management section of app/admin/router.py exactly. */
@Injectable({ providedIn: 'root' })
export class AdminUserService {
  constructor(private readonly http: HttpClient) {}

  list(page = 1, pageSize = 20): Observable<AdminUserListResponse> {
    const params = new HttpParams().set('page', page).set('page_size', pageSize);
    return this.http.get<AdminUserListResponse>(ApiEndpoints.admin.users, { params });
  }

  get(userId: number): Observable<AdminUser> {
    return this.http.get<AdminUser>(ApiEndpoints.admin.user(userId));
  }

  update(userId: number, payload: AdminUserUpdate): Observable<AdminUser> {
    return this.http.put<AdminUser>(ApiEndpoints.admin.user(userId), payload);
  }

  /** Soft-deletes/deactivates the user (backend: DELETE -> is_active = false). */
  deactivate(userId: number): Observable<void> {
    return this.http.delete<void>(ApiEndpoints.admin.user(userId));
  }
}