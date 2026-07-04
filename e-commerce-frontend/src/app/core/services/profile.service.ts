import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiEndpoints } from '../constants/api-endpoints';
import { AccountDetailsUpdate, ChangePasswordRequest, User } from '../models/user.model';

/** Mirrors app/routers/profile_router.py exactly. */
@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private readonly http: HttpClient) {}

  getAccountDetails(): Observable<User> {
    return this.http.get<User>(ApiEndpoints.profile.accountDetails);
  }

  updateAccountDetails(payload: AccountDetailsUpdate): Observable<User> {
    return this.http.put<User>(ApiEndpoints.profile.accountDetails, payload);
  }

  changePassword(payload: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(ApiEndpoints.profile.changePassword, payload);
  }
}