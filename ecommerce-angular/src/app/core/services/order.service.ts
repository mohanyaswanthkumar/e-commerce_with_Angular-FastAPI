import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Order, OrderListResponse, TrackingOrder,
  CheckoutReviewRequest, CheckoutReviewResponse,
  PlaceOrderRequest, ShippingBillingInfo, OrderStatus
} from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Checkout flow
  getShippingBillingInfo(): Observable<ShippingBillingInfo> {
    return this.http.get<ShippingBillingInfo>(`${this.api}/checkout/shipping-billing`);
  }

  reviewOrder(req: CheckoutReviewRequest): Observable<CheckoutReviewResponse> {
    return this.http.post<CheckoutReviewResponse>(`${this.api}/checkout/review`, req);
  }

  placeOrder(req: PlaceOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.api}/checkout/place-order`, req);
  }

  // Order history
  getOrders(params: {
    page?: number;
    page_size?: number;
    status?: OrderStatus;
    favourites_only?: boolean;
    search?: string;
  } = {}): Observable<OrderListResponse> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') httpParams = httpParams.set(k, String(v));
    });
    return this.http.get<OrderListResponse>(`${this.api}/orders`, { params: httpParams });
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.api}/orders/${id}`);
  }

  toggleFavourite(id: number): Observable<{ is_favourite: boolean; message: string }> {
    return this.http.post<{ is_favourite: boolean; message: string }>(
      `${this.api}/orders/${id}/favourite`, {}
    );
  }

  reorder(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.api}/orders/${id}/reorder`, {});
  }

  getTrackingOrders(): Observable<TrackingOrder[]> {
    return this.http.get<TrackingOrder[]>(`${this.api}/orders/tracking/all`);
  }
}
