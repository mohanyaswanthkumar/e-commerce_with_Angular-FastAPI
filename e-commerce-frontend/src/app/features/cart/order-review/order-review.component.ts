import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CheckoutService } from '../../../core/services/checkout.service';
import { OrderReviewOut, PlaceOrderRequest } from '../../../core/models/order.model';
import { NotificationService } from '../../../core/services/notification.service';
import { OrderSummaryComponent } from '../../../shared/components/order-summary/order-summary.component';

/**
 * Cart page, Step 2 of 3 — Order Review.
 * Re-derives the review from the selection made in Step 1 (kept in
 * CheckoutService). If the person lands here directly (e.g. refresh) with
 * no selection in memory, they're bounced back to Step 1.
 */
@Component({
  selector: 'app-order-review',
  standalone: true,
  imports: [CommonModule, OrderSummaryComponent],
  templateUrl: './order-review.component.html',
  styleUrl: './order-review.component.scss',
})
export class OrderReviewComponent implements OnInit {
  readonly review = signal<OrderReviewOut | null>(null);
  readonly isLoading = signal(true);
  readonly isPlacingOrder = signal(false);
  private selection: PlaceOrderRequest | null = null;

  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly notifications: NotificationService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.selection = this.checkoutService.getSelection();
    if (!this.selection) {
      this.router.navigate(['/cart/shipping-billing']);
      return;
    }

    this.checkoutService.getReviewStep(this.selection).subscribe({
      next: (res) => {
        this.review.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/cart/shipping-billing']);
      },
    });
  }

  get paymentTypeLabel(): string {
    const type = this.review()?.payment_type;
    return type === 'invoice_me' ? 'Invoice me' : type === 'credit_card' ? 'Credit card' : type || '';
  }

  placeOrder(): void {
    if (!this.selection) return;

    this.isPlacingOrder.set(true);
    this.checkoutService.placeOrder(this.selection).subscribe({
      next: (confirmation) => {
        this.isPlacingOrder.set(false);
        this.notifications.showSuccess('Order placed successfully!');
        this.router.navigate(['/cart/confirmation', confirmation.id]);
      },
      error: () => this.isPlacingOrder.set(false),
    });
  }

  back(): void {
    this.router.navigate(['/cart/shipping-billing']);
  }
}