import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { CheckoutStateService } from '../checkout-state.service';
import { CheckoutReviewResponse } from '../../../shared/models';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (loading()) {
      <div class="loading-overlay"><div class="spinner"></div></div>
    } @else if (!reviewData()) {
      <div class="alert alert-danger">
        Session expired. <a href="/cart/shipping" style="color:inherit;font-weight:700">Go back</a> to restart checkout.
      </div>
    } @else {
      <div class="checkout-layout">
        <div class="checkout-left">

          <!-- Delivery Address -->
          <div class="card" style="margin-bottom:20px">
            <h3 class="section-sub-title">📍 Delivery Address</h3>
            <div class="review-addr">
              <strong>{{ reviewData()!.address.label }}</strong>
              <p>{{ reviewData()!.address.street }}, {{ reviewData()!.address.city }},
                 {{ reviewData()!.address.state }} – {{ reviewData()!.address.postal_code }},
                 {{ reviewData()!.address.country }}</p>
            </div>
          </div>

          <!-- Payment -->
          <div class="card" style="margin-bottom:20px">
            <h3 class="section-sub-title">💳 Payment</h3>
            <p class="review-payment">
              @if (reviewData()!.payment_type === 'invoice') {
                🧾 Invoice Me – Pay after delivery
              } @else if (reviewData()!.credit_card) {
                💳 {{ reviewData()!.credit_card!.card_brand }} •••• {{ reviewData()!.credit_card!.last_four }}
                ({{ reviewData()!.credit_card!.cardholder_name }})
              }
            </p>
          </div>

          <!-- Order Items -->
          <div class="card">
            <h3 class="section-sub-title">🛒 Order Items ({{ reviewData()!.cart_items.length }})</h3>
            <div class="order-items-list">
              @for (item of reviewData()!.cart_items; track item.id) {
                <div class="oi-row">
                  <img [src]="item.product_thumbnail || '/assets/images/placeholder.png'"
                       [alt]="item.product_name" class="oi-img">
                  <div class="oi-info">
                    <p class="oi-name">{{ item.product_name }}</p>
                    <p class="oi-detail">
                      ₹{{ item.product_price | number:'1.2-2' }} × {{ item.quantity }}
                    </p>
                  </div>
                  <p class="oi-subtotal">₹{{ item.subtotal | number:'1.2-2' }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Notes -->
          <div class="card" style="margin-top:20px">
            <h3 class="section-sub-title">📝 Order Notes (Optional)</h3>
            <textarea class="form-control" [(ngModel)]="notes"
                      rows="3" placeholder="Add special instructions or notes..."></textarea>
          </div>
        </div>

        <!-- Summary -->
        <div class="checkout-right">
          <div class="card order-summary-card">
            <h3 class="section-sub-title">Order Summary</h3>
            <div class="summary-rows">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>₹{{ reviewData()!.order_summary.subtotal | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Tax</span>
                <span>₹{{ reviewData()!.order_summary.tax | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span>{{ reviewData()!.order_summary.shipping === 0 ? 'FREE' : ('₹' + (reviewData()!.order_summary.shipping | number:'1.2-2')) }}</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row total-row">
                <strong>Total</strong>
                <strong class="total-amount">₹{{ reviewData()!.order_summary.total | number:'1.2-2' }}</strong>
              </div>
            </div>

            <button class="btn btn-primary btn-full btn-lg" style="margin-top:20px"
                    (click)="placeOrder()" [disabled]="placing()">
              @if (placing()) {
                <span class="spinner spinner-sm"></span> Processing...
              } @else {
                Place Order ✓
              }
            </button>

            <button class="btn btn-ghost btn-full" style="margin-top: 10px"
                    (click)="goBack()">
              ← Back
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .checkout-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
    .section-sub-title { font-size: 16px; font-weight: 700; font-family: var(--font-body); margin-bottom: 16px; }
    .review-addr { background: var(--bg); padding: 14px; border-radius: var(--radius); }
    .review-addr strong { display: block; margin-bottom: 4px; }
    .review-addr p { font-size: 13px; color: var(--text-secondary); margin: 0; }
    .review-payment { font-size: 15px; font-weight: 500; }
    .order-items-list { display: flex; flex-direction: column; gap: 14px; }
    .oi-row { display: flex; gap: 12px; align-items: center; }
    .oi-img { width: 56px; height: 56px; object-fit: cover; border-radius: var(--radius-sm); background: var(--bg); }
    .oi-info { flex: 1; }
    .oi-name { font-size: 14px; font-weight: 500; margin-bottom: 3px; }
    .oi-detail { font-size: 12px; color: var(--text-muted); }
    .oi-subtotal { font-size: 15px; font-weight: 700; white-space: nowrap; }
    .order-summary-card { position: sticky; top: 90px; }
    .summary-rows { display: flex; flex-direction: column; gap: 10px; }
    .summary-row { display: flex; justify-content: space-between; font-size: 14px; }
    .summary-divider { height: 1px; background: var(--border); }
    .total-row { font-size: 16px; }
    .total-amount { color: var(--accent); font-size: 22px; }
    @media (max-width: 900px) { .checkout-layout { grid-template-columns: 1fr; } }
  `]
})
export class ReviewComponent implements OnInit {
  private orderService = inject(OrderService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private checkoutState = inject(CheckoutStateService);

  reviewData = signal<CheckoutReviewResponse | null>(null);
  loading = signal(true);
  placing = signal(false);
  notes = '';

  ngOnInit(): void {
    const shipping = this.checkoutState.shippingData();
    if (!shipping) { this.loading.set(false); return; }

    this.orderService.reviewOrder(shipping).subscribe({
      next: data => { this.reviewData.set(data); this.loading.set(false); },
      error: (e) => { this.loading.set(false); this.toast.error(e.error?.detail || 'Failed to load review'); }
    });
  }

  placeOrder(): void {
    const shipping = this.checkoutState.shippingData();
    if (!shipping) return;
    this.placing.set(true);

    this.orderService.placeOrder({ ...shipping, notes: this.notes }).subscribe({
      next: order => {
        this.checkoutState.setPlacedOrder(order);
        this.cartService.clearCart();
        this.router.navigate(['/cart/confirmation']);
      },
      error: (e) => {
        this.placing.set(false);
        this.toast.error(e.error?.detail || 'Failed to place order. Please try again.');
      }
    });
  }

  goBack(): void { this.router.navigate(['/cart/shipping']); }
}
