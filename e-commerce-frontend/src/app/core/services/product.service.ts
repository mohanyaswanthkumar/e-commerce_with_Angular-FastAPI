import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiEndpoints } from '../constants/api-endpoints';
import { ProductDetail, ProductListResponse } from '../models/product.model';

export interface PlpQuery {
  search?: string | null;
  category_id?: number | null;
  page?: number;
  page_size?: number;
}

/**
 * Mirrors app/routers/product_router.py exactly:
 *  GET  /products               (PLP, guest-accessible -> get_optional_user)
 *  GET  /products/{id}          (PDP, guest-accessible)
 *  POST /products/{id}/wishlist (requires login -> get_current_user)
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private readonly http: HttpClient) {}

  getPlp(query: PlpQuery): Observable<ProductListResponse> {
    let params = new HttpParams()
      .set('page', String(query.page ?? 1))
      .set('page_size', String(query.page_size ?? 20));

    if (query.search) params = params.set('search', query.search);
    if (query.category_id != null) params = params.set('category_id', String(query.category_id));

    return this.http.get<ProductListResponse>(ApiEndpoints.products.plp, { params });
  }

  getPdp(productId: number): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(ApiEndpoints.products.pdp(productId));
  }

  toggleWishlist(productId: number): Observable<{ product_id: number; is_wishlisted: boolean }> {
    return this.http.post<{ product_id: number; is_wishlisted: boolean }>(
      ApiEndpoints.products.wishlist(productId), {},
    );
  }
}