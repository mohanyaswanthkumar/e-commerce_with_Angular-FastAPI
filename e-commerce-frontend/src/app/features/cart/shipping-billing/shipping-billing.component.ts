import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CheckoutService } from '../../../core/services/checkout.service';
import { CheckoutShippingBillingOut } from '../../../core/models/order.model';
import { OrderSummaryComponent } from '../../../shared/components/order-summary/order-summary.component';

/**
 * Cart page, Step 1 of 3 — Shipping & Billing.
 * Top of left column: address dropdown + the payment type selected earlier
 * (Invoice me / Credit card). Below that: cart items. Right column: Order
 * summary with Continue CTA (-> Order Review).
 */
@Component({
  selector: 'app-shipping-billing',
  standalone: true,
  imports: [CommonModule, RouterLink, OrderSummaryComponent],
  templateUrl: './shipping-billing.component.html',
  styleUrl: './shipping-billing.component.scss',
})
export class ShippingBillingComponent implements OnInit {
  readonly data = signal<CheckoutShippingBillingOut | null>(null);
  readonly isLoading = signal(true);
  readonly selectedAddressId = signal<number | null>(null);

  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.checkoutService.getShippingBillingStep().subscribe({
      next: (res) => {
        this.data.set(res);
        this.selectedAddressId.set(res.selected_address_id);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onAddressChange(value: string): void {
    this.selectedAddressId.set(Number(value));
  }

  get paymentTypeLabel(): string {
    const type = this.data()?.payment_type;
    if (type === 'invoice_me') return 'Invoice me';
    if (type === 'credit_card') return 'Credit card';
    return 'Not set — configure it under Payment information';
  }

  get canContinue(): boolean {
    return !!this.selectedAddressId() && !!this.data()?.cart.items.length;
  }

  continue(): void {
    const data = this.data();
    const addressId = this.selectedAddressId();
    if (!data || !addressId || !data.payment_type) return;

    this.checkoutService.setSelection({
      address_id: addressId,
      payment_type: data.payment_type,
      credit_card_id: data.selected_credit_card_id ?? null,
    });
    this.router.navigate(['/cart/review']);
  }

  back(): void {
    this.router.navigate(['/products']);
  }
}