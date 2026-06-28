import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../core/services/profile.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { DashboardStats } from '../../../shared/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  private profileService = inject(ProfileService);
  private productService = inject(ProductService);
  private toast = inject(ToastService);

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  syncing = signal(false);

  ngOnInit(): void {
    this.profileService.getDashboardStats().subscribe({
      next: data => { this.stats.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load dashboard stats'); }
    });
  }

  syncStockFromSap(): void {
    this.syncing.set(true);
    this.productService.adminSyncStockFromSap().subscribe({
      next: (res) => {
        this.syncing.set(false);
        this.toast.success(res.message || 'Stock synced from SAP successfully');
      },
      error: (e) => {
        this.syncing.set(false);
        this.toast.error(e.error?.detail || 'SAP sync failed');
      }
    });
  }
}
