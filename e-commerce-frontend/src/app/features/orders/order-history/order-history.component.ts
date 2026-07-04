import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { OrderService } from '../../../core/services/order.service';
import { OrderStatus, OrderTile } from '../../../core/models/order.model';
import { NotificationService } from '../../../core/services/notification.service';

type TabId = 'all' | 'favourites';

/**
 * Order history page: (All orders / Favourites) tabs, status filters
 * (in-progress / on-hold / completed / refunded), order tiles with a
 * heart icon to favourite and a Re-order CTA.
 */
@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss',
})
export class OrderHistoryComponent implements OnInit {
  readonly orders = signal<OrderTile[]>([]);
  readonly isLoading = signal(true);
  readonly activeTab = signal<TabId>('all');
  readonly statusFilter = signal<OrderStatus | null>(null);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly pageSize = 10;
  readonly reorderingId = signal<number | null>(null);
  readonly togglingFavouriteId = signal<number | null>(null);

  readonly statusOptions: { label: string; value: OrderStatus | null }[] = [
    { label: 'All statuses', value: null },
    { label: 'In progress', value: 'in_progress' },
    { label: 'On hold', value: 'on_hold' },
    { label: 'Completed', value: 'completed' },
    { label: 'Refunded', value: 'refunded' },
  ];

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total() / this.pageSize));
  }

  constructor(
    private readonly orderService: OrderService,
    private readonly notifications: NotificationService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  selectTab(tab: TabId): void {
    this.activeTab.set(tab);
    this.page.set(1);
    this.fetch();
  }

  selectStatus(value: string): void {
    this.statusFilter.set((value || null) as OrderStatus | null);
    this.page.set(1);
    this.fetch();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.page.set(page);
    this.fetch();
  }

  private fetch(): void {
    this.isLoading.set(true);
    this.orderService
      .getOrderHistory({
        status: this.statusFilter(),
        favourites_only: this.activeTab() === 'favourites',
        page: this.page(),
        page_size: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.orders.set(res.items);
          this.total.set(res.total);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  viewDetails(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
  }

  toggleFavourite(order: OrderTile, event: Event): void {
    event.stopPropagation();
    this.togglingFavouriteId.set(order.id);
    this.orderService.toggleFavourite(order.id).subscribe({
      next: (res) => {
        this.orders.update((list) =>
          list.map((o) => (o.id === order.id ? { ...o, is_favourite: res.is_favourite } : o)),
        );
        this.togglingFavouriteId.set(null);
        if (this.activeTab() === 'favourites' && !res.is_favourite) this.fetch();
      },
      error: () => this.togglingFavouriteId.set(null),
    });
  }

  reorder(order: OrderTile, event: Event): void {
    event.stopPropagation();
    this.reorderingId.set(order.id);
    this.orderService.reorder(order.id).subscribe({
      next: (res) => {
        this.notifications.showSuccess(res.message);
        this.reorderingId.set(null);
      },
      error: () => this.reorderingId.set(null),
    });
  }
}