import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, OrderStatus } from '../../../shared/models';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <div class="page-content">
      <div class="container">
        <h1 class="section-title">My Orders</h1>

        <!-- Tabs -->
        <div class="tabs">
          <button class="tab-btn" [class.active]="activeTab() === 'all'" (click)="setTab('all')">
            All Orders
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'favourites'" (click)="setTab('favourites')">
            ❤️ Favourites
          </button>
        </div>

        <!-- Search + Filters -->
        <div class="order-filters">
          <div class="search-bar" style="flex:1; max-width: 360px">
            <span class="search-icon">🔍</span>
            <input type="text" [(ngModel)]="searchTerm" (input)="onSearch()"
                   placeholder="Search by order number...">
          </div>

          <div class="filter-chips">
            @for (status of statusFilters; track status.value) {
              <button class="chip" [class.active]="selectedStatus() === status.value"
                      (click)="setStatusFilter(status.value)">
                {{ status.label }}
              </button>
            }
          </div>
        </div>

        @if (loading()) {
          <div class="loading-overlay"><div class="spinner"></div></div>
        } @else if (orders().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>{{ activeTab() === 'favourites' ? 'No favourite orders yet' : 'No orders found' }}</h3>
            <p>{{ activeTab() === 'favourites' ? 'Heart an order to save it here' : 'Place your first order to see it here' }}</p>
            <a routerLink="/products" class="btn btn-primary">Browse Products</a>
          </div>
        } @else {
          <div class="orders-list">
            @for (order of orders(); track order.id) {
              <div class="order-tile card">
                <div class="order-tile-header">
                  <div class="order-nums">
                    <span class="order-num">#{{ order.order_number }}</span>
                    @if (order.sap_sales_order_number) {
                      <span class="sap-num">SAP: {{ order.sap_sales_order_number }}</span>
                    }
                  </div>
                  <div class="order-tile-actions">
                    <button class="heart-btn" [class.active]="order.is_favourite"
                            (click)="toggleFavourite(order)" title="Favourite">
                      {{ order.is_favourite ? '❤️' : '🤍' }}
                    </button>
                    <span class="badge" [class]="statusBadge(order.status)">{{ order.status | titlecase }}</span>
                  </div>
                </div>

                <div class="order-tile-body">
                  <div class="order-items-preview">
                    @for (item of order.items.slice(0,3); track item.id) {
                      <div class="order-item-mini">
                        <img [src]="item.product_thumbnail || '/assets/images/placeholder.png'"
                             [alt]="item.product_name" class="mini-img">
                        <div>
                          <p class="mini-name">{{ item.product_name }}</p>
                          <p class="mini-qty">Qty: {{ item.quantity }}</p>
                        </div>
                      </div>
                    }
                    @if (order.items.length > 3) {
                      <div class="more-items">+{{ order.items.length - 3 }} more</div>
                    }
                  </div>

                  <div class="order-tile-meta">
                    <div class="meta-row">
                      <span class="meta-label">Date</span>
                      <span>{{ order.created_at | date:'mediumDate' }}</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-label">Payment</span>
                      <span>{{ order.payment_type | titlecase }}</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-label">Total</span>
                      <strong class="order-total">₹{{ order.total | number:'1.2-2' }}</strong>
                    </div>
                  </div>
                </div>

                <div class="order-tile-footer">
                  <a [routerLink]="['/orders', order.id]" class="btn btn-ghost btn-sm">
                    View Details
                  </a>
                  <button class="btn btn-outline btn-sm" (click)="reorder(order)"
                          [disabled]="reordering[order.id]">
                    @if (reordering[order.id]) { <span class="spinner spinner-sm"></span> }
                    🔁 Reorder
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="pagination">
              <button [disabled]="page() === 1" (click)="goToPage(page()-1)">‹</button>
              @for (p of pageNums(); track p) {
                <button [class.active]="p === page()" (click)="goToPage(p)">{{ p }}</button>
              }
              <button [disabled]="page() === totalPages()" (click)="goToPage(page()+1)">›</button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .order-filters {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 28px;
      flex-wrap: wrap;
    }

    .filter-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .chip {
      padding: 6px 14px;
      border-radius: 50px;
      border: 1.5px solid var(--border);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      background: white;
      cursor: pointer;
      transition: all var(--transition);

      &.active {
        background: var(--primary);
        border-color: var(--primary);
        color: white;
      }

      &:hover:not(.active) { border-color: var(--primary); color: var(--primary); }
    }

    .orders-list { display: flex; flex-direction: column; gap: 20px; }

    .order-tile { padding: 20px; }

    .order-tile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .order-nums { display: flex; flex-direction: column; gap: 2px; }
    .order-num { font-size: 16px; font-weight: 700; font-family: monospace; }
    .sap-num { font-size: 12px; color: var(--info); font-weight: 600; }

    .order-tile-actions { display: flex; align-items: center; gap: 10px; }
    .heart-btn { background: none; border: none; font-size: 20px; cursor: pointer; transition: transform var(--transition); &:hover { transform: scale(1.2); } }

    .order-tile-body { display: grid; grid-template-columns: 1fr auto; gap: 20px; margin-bottom: 16px; }

    .order-items-preview { display: flex; flex-direction: column; gap: 10px; }
    .order-item-mini { display: flex; gap: 10px; align-items: center; }
    .mini-img { width: 44px; height: 44px; object-fit: cover; border-radius: var(--radius-sm); background: var(--bg); }
    .mini-name { font-size: 13px; font-weight: 500; }
    .mini-qty { font-size: 12px; color: var(--text-muted); }
    .more-items { font-size: 12px; color: var(--text-muted); font-style: italic; padding-left: 54px; }

    .order-tile-meta { display: flex; flex-direction: column; gap: 8px; text-align: right; min-width: 140px; }
    .meta-row { display: flex; justify-content: space-between; gap: 16px; font-size: 13px; }
    .meta-label { color: var(--text-muted); }
    .order-total { color: var(--accent); font-size: 16px; }

    .order-tile-footer {
      display: flex;
      gap: 10px;
      border-top: 1px solid var(--border-light);
      padding-top: 16px;
    }

    @media (max-width: 768px) {
      .order-tile-body { grid-template-columns: 1fr; }
      .order-tile-meta { text-align: left; }
      .meta-row { justify-content: flex-start; }
    }
  `]
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);
  private cartService = inject(CartService);
  private toast = inject(ToastService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  activeTab = signal<'all' | 'favourites'>('all');
  selectedStatus = signal<OrderStatus | ''>('');
  searchTerm = '';
  page = signal(1);
  total = signal(0);
  pageSize = 10;
  searchTimeout?: ReturnType<typeof setTimeout>;
  reordering: Record<number, boolean> = {};

  totalPages = () => Math.ceil(this.total() / this.pageSize);
  pageNums = () => {
    const arr: number[] = [];
    for (let i = Math.max(1, this.page() - 2); i <= Math.min(this.totalPages(), this.page() + 2); i++) arr.push(i);
    return arr;
  };

  statusFilters = [
    { label: 'All', value: '' as OrderStatus | '' },
    { label: 'In Progress', value: 'in_progress' as OrderStatus },
    { label: 'On Hold', value: 'on_hold' as OrderStatus },
    { label: 'Completed', value: 'completed' as OrderStatus },
    { label: 'Refunded', value: 'refunded' as OrderStatus }
  ];

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService.getOrders({
      page: this.page(),
      page_size: this.pageSize,
      status: this.selectedStatus() || undefined,
      favourites_only: this.activeTab() === 'favourites' ? true : undefined,
      search: this.searchTerm || undefined
    }).subscribe({
      next: res => { this.orders.set(res.items); this.total.set(res.total); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load orders'); }
    });
  }

  setTab(tab: 'all' | 'favourites'): void { this.activeTab.set(tab); this.page.set(1); this.loadOrders(); }
  setStatusFilter(status: OrderStatus | ''): void { this.selectedStatus.set(status); this.page.set(1); this.loadOrders(); }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => { this.page.set(1); this.loadOrders(); }, 400);
  }

  goToPage(p: number): void { this.page.set(p); this.loadOrders(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  toggleFavourite(order: Order): void {
    this.orderService.toggleFavourite(order.id).subscribe({
      next: res => { order.is_favourite = res.is_favourite; this.toast.success(res.message); }
    });
  }

  reorder(order: Order): void {
    this.reordering[order.id] = true;
    this.orderService.reorder(order.id).subscribe({
      next: (res) => {
        this.reordering[order.id] = false;
        this.toast.success(res.message);
        this.cartService.loadCart().subscribe();
      },
      error: (e) => { this.reordering[order.id] = false; this.toast.error(e.error?.detail || 'Reorder failed'); }
    });
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
