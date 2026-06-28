import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { TrackingOrder } from '../../../shared/models';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-content">
      <div class="container">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:32px">
          <a routerLink="/orders" class="btn btn-ghost btn-sm">← Orders</a>
          <h1 class="section-title" style="margin-bottom:0">Track My Orders</h1>
        </div>

        @if (loading()) {
          <div class="loading-overlay"><div class="spinner"></div></div>
        } @else if (orders().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>No orders to track</h3>
            <a routerLink="/products" class="btn btn-primary">Start Shopping</a>
          </div>
        } @else {
          <div class="tracking-list">
            @for (order of orders(); track order.order_number) {
              <div class="card tracking-card">
                <div class="tracking-header">
                  <div>
                    <span class="track-num">#{{ order.order_number }}</span>
                    @if (order.sap_sales_order_number) {
                      <span class="sap-ref"> · SAP: {{ order.sap_sales_order_number }}</span>
                    }
                    <p class="track-date">Placed: {{ order.created_at | date:'mediumDate' }}</p>
                  </div>
                  <span class="badge" [class]="statusBadge(order.status)" style="font-size:13px;padding:6px 16px">
                    {{ order.status | titlecase }}
                  </span>
                </div>

                <!-- Progress Steps -->
                <div class="tracking-steps">
                  @for (step of order.tracking_steps; track $index) {
                    <div class="track-step" [class]="step.status">
                      <div class="step-indicator">
                        <div class="step-dot">
                          @if (step.status === 'completed') { ✓ }
                          @else if (step.status === 'active') { ● }
                          @else { ○ }
                        </div>
                        @if (!$last) {
                          <div class="step-line" [class.filled]="step.status === 'completed'"></div>
                        }
                      </div>
                      <div class="step-info">
                        <p class="step-label">{{ step.label }}</p>
                        @if (step.timestamp) {
                          <p class="step-time">{{ step.timestamp | date:'short' }}</p>
                        }
                      </div>
                    </div>
                  }
                </div>

                @if (order.estimated_delivery) {
                  <div class="eta-badge">
                    🚚 Estimated Delivery: {{ order.estimated_delivery | date:'mediumDate' }}
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .tracking-list { display: flex; flex-direction: column; gap: 24px; }

    .tracking-card { padding: 24px; }

    .tracking-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .track-num { font-size: 18px; font-weight: 700; font-family: monospace; }
    .sap-ref { font-size: 13px; color: var(--info); }
    .track-date { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

    /* Steps horizontal layout */
    .tracking-steps {
      display: flex;
      gap: 0;
      margin-bottom: 16px;
      overflow-x: auto;
      padding-bottom: 8px;
    }

    .track-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      min-width: 100px;
    }

    .step-indicator {
      display: flex;
      align-items: center;
      width: 100%;
      position: relative;
      margin-bottom: 8px;
    }

    .step-dot {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2.5px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      background: white;
      flex-shrink: 0;
      z-index: 1;
      transition: all 0.3s;
    }

    .step-line {
      height: 2.5px;
      flex: 1;
      background: var(--border);
      &.filled { background: var(--success); }
    }

    .track-step.completed .step-dot {
      background: var(--success);
      border-color: var(--success);
      color: white;
    }

    .track-step.active .step-dot {
      background: var(--accent);
      border-color: var(--accent);
      color: white;
      box-shadow: 0 0 0 4px rgba(233,69,96,0.2);
    }

    .step-info { text-align: center; }
    .step-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); }
    .step-time { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

    .track-step.completed .step-label { color: var(--success); }
    .track-step.active .step-label { color: var(--accent); }

    .eta-badge {
      background: rgba(59,130,246,0.08);
      color: var(--info);
      padding: 10px 16px;
      border-radius: var(--radius);
      font-size: 13px;
      font-weight: 600;
      border: 1px solid rgba(59,130,246,0.2);
    }
  `]
})
export class OrderTrackingComponent implements OnInit {
  private orderService = inject(OrderService);
  private toast = inject(ToastService);

  orders = signal<TrackingOrder[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.orderService.getTrackingOrders().subscribe({
      next: data => { this.orders.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load tracking data'); }
    });
  }

  statusBadge(s: string) {
    return ({completed:'badge badge-success',in_progress:'badge badge-info',pending:'badge badge-warning',on_hold:'badge badge-warning',refunded:'badge badge-muted',cancelled:'badge badge-danger'} as any)[s] ?? 'badge badge-muted';
  }
}
