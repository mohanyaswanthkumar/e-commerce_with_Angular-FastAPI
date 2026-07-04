import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiEndpoints } from '../constants/api-endpoints';
import {
  CreditCard, CreditCardCreate, CreditCardUpdate, PaymentPreference, PaymentPreferenceUpdate,
} from '../models/payment.model';

/** Mirrors app/routers/payment_router.py exactly. */
@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private readonly http: HttpClient) {}

  listCreditCards(): Observable<CreditCard[]> {
    return this.http.get<CreditCard[]>(ApiEndpoints.payments.creditCards);
  }

  addCreditCard(payload: CreditCardCreate): Observable<CreditCard> {
    return this.http.post<CreditCard>(ApiEndpoints.payments.creditCards, payload);
  }

  updateCreditCard(cardId: number, payload: CreditCardUpdate): Observable<CreditCard> {
    return this.http.put<CreditCard>(ApiEndpoints.payments.creditCard(cardId), payload);
  }

  deleteCreditCard(cardId: number): Observable<void> {
    return this.http.delete<void>(ApiEndpoints.payments.creditCard(cardId));
  }

  /** Backend returns null (200 OK) when no preference has ever been set. */
  getPreference(): Observable<PaymentPreference | null> {
    return this.http.get<PaymentPreference | null>(ApiEndpoints.payments.preference);
  }

  setPreference(payload: PaymentPreferenceUpdate): Observable<PaymentPreference> {
    return this.http.put<PaymentPreference>(ApiEndpoints.payments.preference, payload);
  }
}