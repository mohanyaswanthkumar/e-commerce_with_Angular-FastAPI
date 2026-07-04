import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { OrderService } from '../../../core/services/order.service';
import { TrackOrderTile } from '../../../core/models/order.model';

/** Track my order page: all order tiles with their tracking status. */
@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './track-order.component.html',
  styleUrl: './track-order.component.scss',
})
export class TrackOrderComponent implements OnInit {
  readonly orders = signal<TrackOrderTile[]>([]);
  readonly isLoading = signal(true);

  constructor(private readonly orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getTracking().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}

