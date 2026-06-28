import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CheckoutStateService } from '../checkout-state.service';
import { Order } from '../../../shared/models';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    @if (!order) {
      <div class="empty-state">
        <div class="empty-icon">🤔</div>
        <h3>No order to confirm</h3>
        <a routerLink="/products" class="btn btn-primary">Start Shopping</a>
      </div>
    } @else {
      <div class="confirmation-page">
        <div class="success-hero">
          <div class="success-icon">✅</div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your order. We're processing it now.</p>
        </div>

        <div class="order-info-grid">
          <!-- Order Numbers -->
          <div class="card">
            <h3 class="info-title">Order Reference</h3>
            <div class="order-refs">
              <div class="ref-item">
                <span class="ref-label">Local Order ID</span>
                <span class="ref-value">#{{ order.order_number }}</span>
              </div>
              @if (order.sap_sales_order_number) {
                <div class="ref-item">
                  <span class="ref-label">SAP Sales Order</span>
                  <span class="ref-value sap-ref">{{ order.sap_sales_order_number }}</span>
                </div>
              }
              <div class="ref-item">
                <span class="ref-label">SAP Sync Status</span>
                <span class="badge" [class]="syncBadge(order.sap_sync_status)">
                  {{ order.sap_sync_status | titlecase }}
                </span>
              </div>
            </div>
          </div>

          <!-- Payment & Delivery -->
          <div class="card">
            <h3 class="info-title">Order Details</h3>
            <div class="detail-rows">
              <div class="detail-row">
                <span>Payment</span>
                <span>{{ order.payment_type | titlecase }}</span>
              </div>
              <div class="detail-row">
                <span>Status</span>
                <span class="badge" [class]="statusBadge(order.status)">{{ order.status | titlecase }}</span>
              </div>
              <div class="detail-row">
                <span>Items</span>
                <span>{{ order.items.length }} item(s)</span>
              </div>
              <div class="detail-row total">
                <strong>Total Paid</strong>
                <strong class="total-val">₹{{ order.total | number:'1.2-2' }}</strong>
              </div>
            </div>
          </div>

          <!-- Delivery Address -->
          <div class="card">
            <h3 class="info-title">📍 Delivery To</h3>
            <div class="addr-box">
              <strong>{{ order.address.label }}</strong>
              <p>{{ order.address.street }}, {{ order.address.city }},
                 {{ order.address.state }} – {{ order.address.postal_code }}, {{ order.address.country }}</p>
            </div>
          </div>

          <!-- Order Items -->
          <div class="card">
            <h3 class="info-title">Items Ordered</h3>
            <div class="items-list">
              @for (item of order.items; track item.id) {
                <div class="conf-item">
                  <img [src]="item.product_thumbnail || '/assets/images/placeholder.png'"
                       [alt]="item.product_name" class="conf-img">
                  <div class="conf-info">
                    <p>{{ item.product_name }}</p>
                    <small>Qty: {{ item.quantity }} × ₹{{ item.unit_price | number:'1.2-2' }}</small>
                  </div>
                  <span>₹{{ item.subtotal | number:'1.2-2' }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="conf-actions">
          <a routerLink="/orders" class="btn btn-secondary">View All Orders</a>
          <a [routerLink]="['/orders', order.id]" class="btn btn-outline">Order Details</a>
          <a routerLink="/products" class="btn btn-primary">Continue Shopping</a>
        </div>
      </div>
    }
  `,
  styles: [`
    .confirmation-page { max-width: 900px; margin: 0 auto; }

    .success-hero {
      text-align: center;
      padding: 40px 20px;
      margin-bottom: 32px;

      .success-icon { font-size: 72px; display: block; margin-bottom: 16px; animation: bounceIn 0.5s; }
      h1 { font-size: 32px; margin-bottom: 8px; color: var(--success); }
      p { font-size: 16px; color: var(--text-secondary); }
    }

    @keyframes bounceIn {
      0% { transform: scale(0); }
      70% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    .order-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 32px;
    }

    .info-title { font-size: 15px; font-weight: 700; font-family: var(--font-body); margin-bottom: 16px; }

    .order-refs { display: flex; flex-direction: column; gap: 12px; }
    .ref-item { display: flex; justify-content: space-between; align-items: center; }
    .ref-label { font-size: 13px; color: var(--text-secondary); }
    .ref-value { font-size: 15px; font-weight: 700; font-family: monospace; }
    .sap-ref { color: var(--info); }

    .detail-rows { display: flex; flex-direction: column; gap: 10px; }
    .detail-row { display: flex; justify-content: space-between; font-size: 14px; }
    .detail-row.total { font-size: 16px; padding-top: 10px; border-top: 1px solid var(--border); }
    .total-val { color: var(--accent); font-size: 20px; }

    .addr-box { background: var(--bg); padding: 14px; border-radius: var(--radius); }
    .addr-box strong { display: block; margin-bottom: 6px; }
    .addr-box p { font-size: 13px; color: var(--text-secondary); margin: 0; }

    .items-list { display: flex; flex-direction: column; gap: 12px; }
    .conf-item { display: flex; gap: 12px; align-items: center; }
    .conf-img { width: 48px; height: 48px; object-fit: cover; border-radius: var(--radius-sm); background: var(--bg); }
    .conf-info { flex: 1; p { font-size: 14px; font-weight: 500; } small { font-size: 12px; color: var(--text-muted); } }

    .conf-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

    @media (max-width: 768px) { .order-info-grid { grid-template-columns: 1fr; } }
  `]
})
export class ConfirmationComponent implements OnInit {
  private checkoutState = inject(CheckoutStateService);
  private router = inject(Router);

  order: Order | null = null;

  ngOnInit(): void {
    this.order = this.checkoutState.placedOrder();
    if (!this.order) { this.router.navigate(['/cart/shipping']); }
    // clear state after showing
    setTimeout(() => this.checkoutState.clear(), 5000);
  }

  syncBadge(status: string): string {
    return { synced: 'badge badge-success', pending: 'badge badge-warning', failed: 'badge badge-danger' }[status] ?? 'badge badge-muted';
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      completed: 'badge badge-success', in_progress: 'badge badge-info',
      pending: 'badge badge-warning', on_hold: 'badge badge-warning',
      refunded: 'badge badge-muted', cancelled: 'badge badge-danger'
    };
    return map[status] ?? 'badge badge-muted';
  }
}
