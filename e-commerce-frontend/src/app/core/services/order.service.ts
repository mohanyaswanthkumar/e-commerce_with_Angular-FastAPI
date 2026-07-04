import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiEndpoints } from '../constants/api-endpoints';
import {
  OrderDetail, OrderHistoryResponse, OrderStatus, ReorderResponse, TrackOrderTile,
} from '../models/order.model';
import { CartService } from './cart.service';
import { tap } from 'rxjs/operators';

export interface OrderHistoryQuery {
  status?: OrderStatus | null;
  favourites_only?: boolean;
  page?: number;
  page_size?: number;
}

/** Mirrors the /orders/* history, tracking, favourite, and reorder endpoints. */
@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(
    private readonly http: HttpClient,
    private readonly cartService: CartService,
  ) {}

  getOrderHistory(query: OrderHistoryQuery): Observable<OrderHistoryResponse> {
    let params = new HttpParams()
      .set('page', String(query.page ?? 1))
      .set('page_size', String(query.page_size ?? 20))
      .set('favourites_only', String(query.favourites_only ?? false));

    if (query.status) params = params.set('status', query.status);

    return this.http.get<OrderHistoryResponse>(ApiEndpoints.orders.history, { params });
  }

  getOrderDetail(orderId: number): Observable<OrderDetail> {
    return this.http.get<OrderDetail>(ApiEndpoints.orders.detail(orderId));
  }

  toggleFavourite(orderId: number): Observable<{ order_id: number; is_favourite: boolean }> {
    return this.http.post<{ order_id: number; is_favourite: boolean }>(
      ApiEndpoints.orders.favourite(orderId), {},
    );
  }

  /** Re-adds the order's items to the cart; refreshes the header cart badge. */
  reorder(orderId: number): Observable<ReorderResponse> {
    return this.http.post<ReorderResponse>(ApiEndpoints.orders.reorder(orderId), {}).pipe(
      tap(() => this.cartService.refreshCart().subscribe()),
    );
  }

  getTracking(): Observable<TrackOrderTile[]> {
    return this.http.get<TrackOrderTile[]>(ApiEndpoints.orders.trackingAll);
  }
}