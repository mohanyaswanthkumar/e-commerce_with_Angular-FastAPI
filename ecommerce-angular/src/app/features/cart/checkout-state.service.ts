import { Injectable, signal } from '@angular/core';
import { CheckoutReviewRequest, Order } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class CheckoutStateService {
  shippingData = signal<CheckoutReviewRequest | null>(null);
  placedOrder = signal<Order | null>(null);

  setShippingData(data: CheckoutReviewRequest): void {
    this.shippingData.set(data);
  }

  setPlacedOrder(order: Order): void {
    this.placedOrder.set(order);
  }

  clear(): void {
    this.shippingData.set(null);
    this.placedOrder.set(null);
  }
}
