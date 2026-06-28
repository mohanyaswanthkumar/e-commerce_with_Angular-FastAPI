import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order } from '../../../shared/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="page-content">
      <div class="container">
        <div class="breadcrumb" style="margin-bottom:24px">
          <a routerLink="/orders">Orders</a>
          <span>›</span>
          <span>Order Details</span>
        </div>

        @if (loading()) {
          <div class="loading-overlay"><div class="spinner"></div></div>
        } @else if (!order()) {
          <div class="empty-state"><div class="empty-icon">❌</div><h3>Order not found</h3></div>
        } @else {
          <div class="detail-header">
            <div>
              <h1 style="font-size:24px; margin-bottom:4px">Order #{{ order()!.order_number }}</h1>
              @if (order()!.sap_sales_order_number) {
                <p style="font-size:13px; color:var(--info)">SAP: {{ order()!.sap_sales_order_number }}</p>
              }
              <p style="font-size:13px;color:var(--text-muted)">Placed on {{ order()!.created_at | date:'longDate' }}</p>
            </div>
            <div style="display:flex;gap:12px;align-items:center">
              <span class="badge" [class]="statusBadge(order()!.status)" style="font-size:13px;padding:6px 14px">
                {{ order()!.status | titlecase }}
              </span>
              <button class="heart-btn" [class.active]="order()!.is_favourite"
                      (click)="toggleFavourite()">
                {{ order()!.is_favourite ? '❤️' : '🤍' }}
              </button>
            </div>
          </div>

          <div class="detail-grid">
            <!-- Items -->
            <div class="detail-main">
              <div class="card" style="margin-bottom:20px">
                <h3 class="card-title">Order Items</h3>
                @for (item of order()!.items; track item.id) {
                  <div class="item-row">
                    <img [src]="item.product_thumbnail || '/assets/images/placeholder.png'"
                         [alt]="item.product_name" class="item-img">
                    <div class="item-info">
                      <a [routerLink]="['/products', item.product_id]" class="item-name">{{ item.product_name }}</a>
                      <p class="item-detail">₹{{ item.unit_price | number:'1.2-2' }} × {{ item.quantity }}</p>
                    </div>
                    <p class="item-sub">₹{{ item.subtotal | number:'1.2-2' }}</p>
                  </div>
                }
              </div>

              <!-- Price Breakdown -->
              <div class="card">
                <h3 class="card-title">Price Breakdown</h3>
                <div class="price-rows">
                  <div class="price-row"><span>Subtotal</span><span>₹{{ order()!.subtotal | number:'1.2-2' }}</span></div>
                  <div class="price-row"><span>Tax</span><span>₹{{ order()!.tax | number:'1.2-2' }}</span></div>
                  <div class="price-row"><span>Shipping</span><span>{{ order()!.shipping === 0 ? 'FREE' : '₹' + (order()!.shipping | number:'1.2-2') }}</span></div>
                  <div class="price-row total-row"><strong>Total</strong><strong class="price" style="font-size:20px">₹{{ order()!.total | number:'1.2-2' }}</strong></div>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="detail-sidebar">
              <!-- Shipping Address -->
              <div class="card" style="margin-bottom:16px">
                <h3 class="card-title">📍 Delivery Address</h3>
                <div class="sidebar-addr">
                  <strong>{{ order()!.address.label }}</strong>
                  <p>{{ order()!.address.street }}, {{ order()!.address.city }},<br>
                     {{ order()!.address.state }} – {{ order()!.address.postal_code }}<br>
                     {{ order()!.address.country }}</p>
                </div>
              </div>

              <!-- Payment -->
              <div class="card" style="margin-bottom:16px">
                <h3 class="card-title">💳 Payment</h3>
                <p style="font-size:14px">{{ order()!.payment_type | titlecase }}</p>
              </div>

              <!-- SAP Sync -->
              <div class="card" style="margin-bottom:16px">
                <h3 class="card-title">⚙️ SAP Sync</h3>
                <div class="sap-status">
                  <span class="badge" [class]="syncBadge(order()!.sap_sync_status)">
                    {{ order()!.sap_sync_status | titlecase }}
                  </span>
                  @if (order()!.sap_sales_order_number) {
                    <p style="font-size:13px;color:var(--info);margin-top:6px">{{ order()!.sap_sales_order_number }}</p>
                  }
                </div>
              </div>

              <!-- Actions -->
              <button class="btn btn-primary btn-full" (click)="reorder()" [disabled]="reordering()">
                @if (reordering()) { <span class="spinner spinner-sm"></span> }
                🔁 Reorder
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .breadcrumb { display:flex;gap:8px;align-items:center;font-size:13px;color:var(--text-secondary); a{color:var(--accent);} }
    .detail-header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;flex-wrap:wrap;gap:16px; }
    .heart-btn { background:none;border:none;font-size:24px;cursor:pointer;transition:transform .2s;&:hover{transform:scale(1.2)} &.active{} }
    .detail-grid { display:grid;grid-template-columns:1fr 300px;gap:24px;align-items:start; }
    .card-title { font-size:15px;font-weight:700;font-family:var(--font-body);margin-bottom:16px; }
    .item-row { display:flex;gap:14px;align-items:center;padding:12px 0;border-bottom:1px solid var(--border-light);&:last-child{border-bottom:none} }
    .item-img { width:64px;height:64px;object-fit:cover;border-radius:var(--radius-sm);background:var(--bg); }
    .item-info { flex:1; }
    .item-name { font-size:14px;font-weight:600;text-decoration:none;color:var(--text-primary);&:hover{color:var(--accent)} display:block;margin-bottom:4px; }
    .item-detail { font-size:12px;color:var(--text-muted); }
    .item-sub { font-size:15px;font-weight:700;white-space:nowrap; }
    .price-rows { display:flex;flex-direction:column;gap:10px; }
    .price-row { display:flex;justify-content:space-between;font-size:14px; }
    .total-row { padding-top:10px;border-top:1px solid var(--border);font-size:16px; }
    .sidebar-addr { background:var(--bg);padding:12px;border-radius:var(--radius);font-size:13px; strong{display:block;margin-bottom:6px} p{color:var(--text-secondary);margin:0;line-height:1.6} }
    @media (max-width:768px) { .detail-grid{grid-template-columns:1fr} }
  `]
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private cartService = inject(CartService);
  private toast = inject(ToastService);

  order = signal<Order | null>(null);
  loading = signal(true);
  reordering = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getOrder(id).subscribe({
      next: o => { this.order.set(o); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  toggleFavourite(): void {
    const o = this.order();
    if (!o) return;
    this.orderService.toggleFavourite(o.id).subscribe({
      next: res => { this.order.update(ord => ord ? { ...ord, is_favourite: res.is_favourite } : ord); }
    });
  }

  reorder(): void {
    this.reordering.set(true);
    this.orderService.reorder(this.order()!.id).subscribe({
      next: res => {
        this.reordering.set(false);
        this.toast.success(res.message);
        this.cartService.loadCart().subscribe();
      },
      error: (e) => { this.reordering.set(false); this.toast.error(e.error?.detail || 'Reorder failed'); }
    });
  }

  statusBadge(s: string) {
    return ({completed:'badge badge-success',in_progress:'badge badge-info',pending:'badge badge-warning',on_hold:'badge badge-warning',refunded:'badge badge-muted',cancelled:'badge badge-danger'} as any)[s] ?? 'badge badge-muted';
  }

  syncBadge(s: string) {
    return ({synced:'badge badge-success',pending:'badge badge-warning',failed:'badge badge-danger'} as any)[s] ?? 'badge badge-muted';
  }
}
