import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { OrderService } from '../../../core/services/order.service';
import { OrderDetail } from '../../../core/models/order.model';

/**
 * Order details page — reached from an order-history tile.
 * Shows the items placed under that specific order id, plus Local Order ID
 * and SAP Sales Order Number.
 */
@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
})
export class OrderDetailComponent implements OnInit {
  readonly order = signal<OrderDetail | null>(null);
  readonly isLoading = signal(true);
  readonly notFound = signal(false);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly orderService: OrderService,
  ) {}

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('id'));
    if (!orderId) {
      this.notFound.set(true);
      this.isLoading.set(false);
      return;
    }

    this.orderService.getOrderDetail(orderId).subscribe({
      next: (order) => {
        this.order.set(order);
        this.isLoading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.isLoading.set(false);
      },
    });
  }
}