import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiEndpoints } from '../constants/api-endpoints';
import {
  CheckoutShippingBillingOut, OrderConfirmation, OrderReviewOut, PlaceOrderRequest,
} from '../models/order.model';
import { CartService } from './cart.service';

/**
 * Mirrors the 3 checkout endpoints in app/routers/order_router.py exactly:
 *   GET  /checkout/shipping-billing  -> cart page, Step 1
 *   POST /checkout/review            -> cart page, Step 2
 *   POST /checkout/place-order       -> cart page, Step 3 (creates order, triggers SAP sync)
 *
 * Keeps the person's checkout selection (address_id, payment_type, credit_card_id)
 * in memory across the 3 steps/pages, since each step is its own route.
 */
@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private selection: PlaceOrderRequest | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly cartService: CartService,
  ) {}

  getShippingBillingStep(): Observable<CheckoutShippingBillingOut> {
    return this.http.get<CheckoutShippingBillingOut>(ApiEndpoints.checkout.shippingBilling);
  }

  setSelection(selection: PlaceOrderRequest): void {
    this.selection = selection;
  }

  getSelection(): PlaceOrderRequest | null {
    return this.selection;
  }

  getReviewStep(payload: PlaceOrderRequest): Observable<OrderReviewOut> {
    return this.http.post<OrderReviewOut>(ApiEndpoints.checkout.review, payload);
  }

  placeOrder(payload: PlaceOrderRequest): Observable<OrderConfirmation> {
    return this.http.post<OrderConfirmation>(ApiEndpoints.checkout.placeOrder, payload).pipe(
      // Order is placed -> cart is now empty server-side; refresh local cart/badge.
      tap(() => {
        this.selection = null;
        this.cartService.refreshCart().subscribe();
      }),
    );
  }

  getOrderConfirmation(orderId: number): Observable<OrderConfirmation> {
    return this.http.get<OrderConfirmation>(ApiEndpoints.orders.confirmation(orderId));
  }
}