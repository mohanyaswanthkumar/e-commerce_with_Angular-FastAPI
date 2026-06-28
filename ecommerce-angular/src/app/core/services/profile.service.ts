import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User, PasswordChangeRequest,
  Address, AddressRequest,
  CreditCard, CreditCardRequest,
  PaymentPreference, AdminUserResponse, AdminUserUpdateRequest, DashboardStats
} from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Account ──────────────────────────────────────────
  getAccountDetails(): Observable<User> {
    return this.http.get<User>(`${this.api}/profile/account-details`);
  }

  updateAccountDetails(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.api}/profile/account-details`, data);
  }

  changePassword(req: PasswordChangeRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.api}/profile/change-password`, req);
  }

  // ── Addresses ────────────────────────────────────────
  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.api}/addresses`);
  }

  addAddress(req: AddressRequest): Observable<Address> {
    return this.http.post<Address>(`${this.api}/addresses`, req);
  }

  updateAddress(id: number, req: AddressRequest): Observable<Address> {
    return this.http.put<Address>(`${this.api}/addresses/${id}`, req);
  }

  deleteAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/addresses/${id}`);
  }

  // ── Credit Cards ─────────────────────────────────────
  getCreditCards(): Observable<CreditCard[]> {
    return this.http.get<CreditCard[]>(`${this.api}/payments/credit-cards`);
  }

  addCreditCard(req: CreditCardRequest): Observable<CreditCard> {
    return this.http.post<CreditCard>(`${this.api}/payments/credit-cards`, req);
  }

  updateCreditCard(id: number, req: Partial<CreditCardRequest>): Observable<CreditCard> {
    return this.http.put<CreditCard>(`${this.api}/payments/credit-cards/${id}`, req);
  }

  deleteCreditCard(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/payments/credit-cards/${id}`);
  }

  // ── Payment Preference ────────────────────────────────
  getPaymentPreference(): Observable<PaymentPreference> {
    return this.http.get<PaymentPreference>(`${this.api}/payments/preference`);
  }

  updatePaymentPreference(req: PaymentPreference): Observable<PaymentPreference> {
    return this.http.put<PaymentPreference>(`${this.api}/payments/preference`, req);
  }

  // ── Admin ─────────────────────────────────────────────
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.api}/admin/dashboard/stats`);
  }

  getUsers(params: any = {}): Observable<{ items: AdminUserResponse[]; total: number }> {
    return this.http.get<{ items: AdminUserResponse[]; total: number }>(`${this.api}/admin/users`, { params });
  }

  updateUser(id: number, req: AdminUserUpdateRequest): Observable<AdminUserResponse> {
    return this.http.put<AdminUserResponse>(`${this.api}/admin/users/${id}`, req);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/admin/users/${id}`);
  }
}
