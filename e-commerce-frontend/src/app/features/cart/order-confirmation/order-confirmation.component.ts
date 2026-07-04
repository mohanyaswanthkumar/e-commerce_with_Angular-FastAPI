import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, interval, switchMap, takeWhile } from 'rxjs';

import { CheckoutService } from '../../../core/services/checkout.service';
import { OrderConfirmation } from '../../../core/models/order.model';

/**
 * Cart page, Step 3 of 3 — Order Confirmation.
 *
 * Displays BOTH the Local Order ID (order.order_number) and the SAP Sales
 * Order Number (order.sap_sales_order_number), per the SAP RAP integration
 * requirement: "Angular displays both Local Order ID and SAP Order Number."
 *
 * The backend places the order and stores it locally first; the SAP Sales
 * Order sync can be asynchronous (sap_sync_status: 'pending' -> 'synced' or
 * 'failed'). If it's still pending when this page loads, we poll
 * GET /orders/{id}/confirmation every 3s (up to 10 times) until it resolves,
 * so the SAP number appears without the user needing to refresh manually.
 */
@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.scss',
})
export class OrderConfirmationComponent implements OnInit, OnDestroy {
  readonly order = signal<OrderConfirmation | null>(null);
  readonly isLoading = signal(true);
  readonly notFound = signal(false);

  private pollSub?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly checkoutService: CheckoutService,
  ) {}

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    if (!orderId) {
      this.notFound.set(true);
      this.isLoading.set(false);
      return;
    }

    this.checkoutService.getOrderConfirmation(orderId).subscribe({
      next: (order) => {
        this.order.set(order);
        this.isLoading.set(false);
        if (order.sap_sync_status === 'pending') this.startPolling(orderId);
      },
      error: () => {
        this.notFound.set(true);
        this.isLoading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  private startPolling(orderId: number): void {
    let attempts = 0;
    this.pollSub = interval(3000)
      .pipe(
        switchMap(() => this.checkoutService.getOrderConfirmation(orderId)),
        takeWhile(() => {
          attempts++;
          return attempts <= 10;
        }),
      )
      .subscribe((order) => {
        this.order.set(order);
        if (order.sap_sync_status !== 'pending') this.pollSub?.unsubscribe();
      });
  }
}