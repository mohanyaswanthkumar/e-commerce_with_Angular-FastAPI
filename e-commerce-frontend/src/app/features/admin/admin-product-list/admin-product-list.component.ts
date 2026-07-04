import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminProductService } from '../../../core/services/admin-product.service';
import { ProductAdmin } from '../../../core/models/product.model';
import { NotificationService } from '../../../core/services/notification.service';

/** Admin product CRUD list + a manual "Sync stock from SAP" trigger. */
@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-product-list.component.html',
  styleUrl: './admin-product-list.component.scss',
})
export class AdminProductListComponent implements OnInit {
  readonly products = signal<ProductAdmin[]>([]);
  readonly isLoading = signal(true);
  readonly isSyncing = signal(false);
  readonly deletingId = signal<number | null>(null);
  readonly page = signal(1);
  readonly pageSize = 20;

  constructor(
    private readonly adminProductService: AdminProductService,
    private readonly notifications: NotificationService,
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  private fetch(): void {
    this.isLoading.set(true);
    this.adminProductService.list(this.page(), this.pageSize).subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  goToPage(page: number): void {
    if (page < 1) return;
    this.page.set(page);
    this.fetch();
  }

  deleteProduct(product: ProductAdmin): void {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    this.deletingId.set(product.id);
    this.adminProductService.delete(product.id).subscribe({
      next: () => {
        this.products.update((list) => list.filter((p) => p.id !== product.id));
        this.deletingId.set(null);
        this.notifications.showSuccess('Product deleted.');
      },
      error: () => this.deletingId.set(null),
    });
  }

  /** Manually triggers the same SAP RAP OData stock refresh as the scheduled job (per spec). */
  syncStockFromSap(): void {
    this.isSyncing.set(true);
    this.adminProductService.syncStockFromSap().subscribe({
      next: () => {
        this.isSyncing.set(false);
        this.notifications.showSuccess('Stock levels refreshed from SAP.');
        this.fetch();
      },
      error: () => this.isSyncing.set(false),
    });
  }
}