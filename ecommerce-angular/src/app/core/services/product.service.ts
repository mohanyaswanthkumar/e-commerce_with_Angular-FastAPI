import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductListResponse, ProductFilterParams } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProducts(filters: ProductFilterParams = {}): Observable<ProductListResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<ProductListResponse>(`${this.api}/products`, { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.api}/products/${id}`);
  }

  toggleWishlist(productId: number): Observable<{ is_wishlisted: boolean; message: string }> {
    return this.http.post<{ is_wishlisted: boolean; message: string }>(
      `${this.api}/products/${productId}/wishlist`, {}
    );
  }

  getWishlist(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/products/wishlist`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.api}/products/categories`);
  }

  // Admin
  adminGetProducts(params: ProductFilterParams = {}): Observable<ProductListResponse> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
    });
    return this.http.get<ProductListResponse>(`${this.api}/admin/products`, { params: httpParams });
  }

  adminCreateProduct(data: any): Observable<Product> {
    return this.http.post<Product>(`${this.api}/admin/products`, data);
  }

  adminUpdateProduct(id: number, data: any): Observable<Product> {
    return this.http.put<Product>(`${this.api}/admin/products/${id}`, data);
  }

  adminDeleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/admin/products/${id}`);
  }

  adminSyncStockFromSap(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.api}/admin/products/sync-stock-from-sap`, {});
  }
}
