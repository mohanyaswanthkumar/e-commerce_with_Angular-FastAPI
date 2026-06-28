import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { ShippingBillingInfo, Address, CreditCard } from '../../../shared/models';

// shared checkout state service
import { CheckoutStateService } from '../checkout-state.service';

@Component({
  selector: 'app-shipping',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (loading()) {
      <div class="loading-overlay"><div class="spinner"></div></div>
    } @else if (info()) {

      @if (info()!.cart_items.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some products before checking out</p>
          <a href="/products" class="btn btn-primary">Browse Products</a>
        </div>
      } @else {
        <div class="checkout-layout">

          <!-- Left: Shipping + Payment -->
          <div class="checkout-left">

            <!-- Address Selection -->
            <div class="card" style="margin-bottom: 20px">
              <h3 class="section-sub-title">📍 Delivery Address</h3>

              @if (info()!.addresses.length === 0) {
                <div class="alert alert-info">No addresses saved. <a href="/profile/addresses">Add an address</a> first.</div>
              } @else {
                <div class="address-list">
                  @for (addr of info()!.addresses; track addr.id) {
                    <label class="address-option" [class.selected]="selectedAddressId() === addr.id">
                      <input type="radio" [value]="addr.id" [(ngModel)]="selectedAddressIdVal"
                             (change)="selectedAddressId.set(addr.id)" name="address">
                      <div class="addr-content">
                        <div class="addr-label">
                          <strong>{{ addr.label }}</strong>
                          @if (addr.is_default) { <span class="badge badge-info" style="font-size:10px">Default</span> }
                        </div>
                        <p class="addr-text">{{ addr.street }}, {{ addr.city }}, {{ addr.state }} – {{ addr.postal_code }}, {{ addr.country }}</p>
                      </div>
                    </label>
                  }
                </div>
              }
            </div>

            <!-- Payment Method -->
            <div class="card" style="margin-bottom: 20px">
              <h3 class="section-sub-title">💳 Payment Method</h3>
              <div class="payment-options">
                <label class="payment-option" [class.selected]="selectedPaymentType() === 'invoice'">
                  <input type="radio" value="invoice" [(ngModel)]="selectedPaymentTypeVal"
                         (change)="selectedPaymentType.set('invoice')" name="payment">
                  <span class="pay-icon">🧾</span>
                  <div>
                    <strong>Invoice Me</strong>
                    <p>Pay via invoice after delivery</p>
                  </div>
                </label>

                <label class="payment-option" [class.selected]="selectedPaymentType() === 'credit_card'">
                  <input type="radio" value="credit_card" [(ngModel)]="selectedPaymentTypeVal"
                         (change)="selectedPaymentType.set('credit_card')" name="payment">
                  <span class="pay-icon">💳</span>
                  <div>
                    <strong>Credit Card</strong>
                    <p>Pay with saved credit card</p>
                  </div>
                </label>
              </div>

              @if (selectedPaymentType() === 'credit_card') {
                <div style="margin-top: 16px">
                  @if (activeCards().length === 0) {
                    <div class="alert alert-info">No active credit cards. <a href="/profile/payments/credit-cards">Add one</a>.</div>
                  } @else {
                    <select class="form-control" [(ngModel)]="selectedCardIdVal"
                            (change)="selectedCardId.set(+selectedCardIdVal)">
                      <option value="">-- Select a card --</option>
                      @for (card of activeCards(); track card.id) {
                        <option [value]="card.id">
                          {{ card.card_brand }} •••• {{ card.last_four }} ({{ card.cardholder_name }})
                        </option>
                      }
                    </select>
                  }
                </div>
              }
            </div>

            <!-- Cart Items Preview -->
            <div class="card">
              <h3 class="section-sub-title">🛒 Items in Cart ({{ info()!.cart_items.length }})</h3>
              <div class="cart-items-list">
                @for (item of info()!.cart_items; track item.id) {
                  <div class="cart-item-row">
                    <img [src]="item.product_thumbnail || '/assets/images/placeholder.png'" [alt]="item.product_name" class="ci-img">
                    <div class="ci-info">
                      <p class="ci-name">{{ item.product_name }}</p>
                      <p class="ci-qty">Qty: {{ item.quantity }}</p>
                    </div>
                    <p class="ci-price">₹{{ item.subtotal | number:'1.2-2' }}</p>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Right: Order Summary -->
          <div class="checkout-right">
            <div class="card order-summary-card">
              <h3 class="section-sub-title">Order Summary</h3>
              <div class="summary-rows">
                <div class="summary-row">
                  <span>Subtotal ({{ info()!.order_summary.total_items }} items)</span>
                  <span>₹{{ info()!.order_summary.subtotal | number:'1.2-2' }}</span>
                </div>
                <div class="summary-row">
                  <span>Tax</span>
                  <span>₹{{ info()!.order_summary.tax | number:'1.2-2' }}</span>
                </div>
                <div class="summary-row">
                  <span>Shipping</span>
                  <span>{{ info()!.order_summary.shipping === 0 ? 'FREE' : '₹' + (info()!.order_summary.shipping | number:'1.2-2') }}</span>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-row total-row">
                  <strong>Total</strong>
                  <strong class="total-amount">₹{{ info()!.order_summary.total | number:'1.2-2' }}</strong>
                </div>
              </div>

              <button class="btn btn-primary btn-full btn-lg" style="margin-top: 20px"
                      (click)="proceed()" [disabled]="!canProceed() || proceeding()">
                @if (proceeding()) { <span class="spinner spinner-sm"></span> }
                Continue to Review →
              </button>
            </div>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    .checkout-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
    .section-sub-title { font-size: 16px; font-weight: 700; font-family: var(--font-body); margin-bottom: 16px; }

    .address-list { display: flex; flex-direction: column; gap: 10px; }
    .address-option {
      display: flex; align-items: flex-start; gap: 12px; padding: 14px; border: 1.5px solid var(--border);
      border-radius: var(--radius); cursor: pointer; transition: border-color var(--transition);
      input { margin-top: 2px; accent-color: var(--accent); flex-shrink: 0; }
      &.selected { border-color: var(--accent); background: rgba(233,69,96,0.03); }
    }
    .addr-label { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .addr-text { font-size: 13px; color: var(--text-secondary); }

    .payment-options { display: flex; gap: 12px; flex-direction: column; }
    .payment-option {
      display: flex; align-items: center; gap: 12px; padding: 14px; border: 1.5px solid var(--border);
      border-radius: var(--radius); cursor: pointer; transition: all var(--transition);
      input { accent-color: var(--accent); }
      .pay-icon { font-size: 22px; }
      strong { display: block; margin-bottom: 2px; }
      p { font-size: 12px; color: var(--text-secondary); margin: 0; }
      &.selected { border-color: var(--accent); background: rgba(233,69,96,0.03); }
    }

    .cart-items-list { display: flex; flex-direction: column; gap: 12px; }
    .cart-item-row { display: flex; align-items: center; gap: 12px; }
    .ci-img { width: 48px; height: 48px; object-fit: cover; border-radius: var(--radius-sm); background: var(--bg); }
    .ci-info { flex: 1; }
    .ci-name { font-size: 13px; font-weight: 500; }
    .ci-qty { font-size: 12px; color: var(--text-muted); }
    .ci-price { font-size: 14px; font-weight: 600; white-space: nowrap; }

    .order-summary-card { position: sticky; top: 90px; }
    .summary-rows { display: flex; flex-direction: column; gap: 10px; }
    .summary-row { display: flex; justify-content: space-between; font-size: 14px; }
    .summary-divider { height: 1px; background: var(--border); }
    .total-row { font-size: 16px; }
    .total-amount { color: var(--accent); font-size: 22px; }

    @media (max-width: 900px) { .checkout-layout { grid-template-columns: 1fr; } }
  `]
})
export class ShippingComponent implements OnInit {
  private orderService = inject(OrderService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private checkoutState = inject(CheckoutStateService);

  info = signal<ShippingBillingInfo | null>(null);
  loading = signal(true);
  proceeding = signal(false);

  selectedAddressId = signal<number>(0);
  selectedAddressIdVal = 0;
  selectedPaymentType = signal<'invoice' | 'credit_card'>('invoice');
  selectedPaymentTypeVal = 'invoice';
  selectedCardId = signal<number>(0);
  selectedCardIdVal = '';

  ngOnInit(): void {
    this.orderService.getShippingBillingInfo().subscribe({
      next: data => {
        this.info.set(data);
        // Pre-select saved preferences
        const defaultAddr = data.addresses.find(a => a.is_default) ?? data.addresses[0];
        if (defaultAddr) {
          this.selectedAddressId.set(defaultAddr.id);
          this.selectedAddressIdVal = defaultAddr.id;
        }
        if (data.payment_preference?.payment_type) {
          this.selectedPaymentType.set(data.payment_preference.payment_type);
          this.selectedPaymentTypeVal = data.payment_preference.payment_type;
          if (data.payment_preference.credit_card_id) {
            this.selectedCardId.set(data.payment_preference.credit_card_id);
            this.selectedCardIdVal = String(data.payment_preference.credit_card_id);
          }
        }
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Failed to load checkout info'); }
    });
  }

  get activeCards(): () => CreditCard[] {
    return () => (this.info()?.credit_cards ?? []).filter(c => c.status === 'active');
  }

  canProceed(): boolean {
    const hasAddress = this.selectedAddressId() > 0;
    const hasPayment = this.selectedPaymentType() === 'invoice' ||
      (this.selectedPaymentType() === 'credit_card' && this.selectedCardId() > 0);
    return hasAddress && hasPayment;
  }

  proceed(): void {
    if (!this.canProceed()) { this.toast.warning('Please select address and payment method'); return; }
    this.checkoutState.setShippingData({
      address_id: this.selectedAddressId(),
      payment_type: this.selectedPaymentType(),
      credit_card_id: this.selectedPaymentType() === 'credit_card' ? this.selectedCardId() : null
    });
    this.router.navigate(['/cart/review']);
  }
}
