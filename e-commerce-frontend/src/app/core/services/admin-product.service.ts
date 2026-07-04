import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiEndpoints } from '../constants/api-endpoints';
import { ProductAdmin, ProductCreate, ProductUpdate } from '../models/product.model';

/** Mirrors the Product CRUD section of app/admin/router.py exactly. */
@Injectable({ providedIn: 'root' })
export class AdminProductService {
  constructor(private readonly http: HttpClient) {}

  list(page = 1, pageSize = 20): Observable<ProductAdmin[]> {
    const params = new HttpParams().set('page', page).set('page_size', pageSize);
    return this.http.get<ProductAdmin[]>(ApiEndpoints.admin.products, { params });
  }

  create(payload: ProductCreate): Observable<ProductAdmin> {
    return this.http.post<ProductAdmin>(ApiEndpoints.admin.products, payload);
  }

  update(productId: number, payload: ProductUpdate): Observable<ProductAdmin> {
    return this.http.put<ProductAdmin>(ApiEndpoints.admin.product(productId), payload);
  }

  delete(productId: number): Observable<void> {
    return this.http.delete<void>(ApiEndpoints.admin.product(productId));
  }

  /** Manually triggers the same SAP RAP OData stock refresh as the scheduled job. */
  syncStockFromSap(productIds?: number[]): Observable<unknown> {
    let params = new HttpParams();
    (productIds ?? []).forEach((id) => (params = params.append('product_ids', id)));
    return this.http.post(ApiEndpoints.admin.syncStockFromSap, null, { params });
  }
}