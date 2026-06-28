import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, AddToCartRequest, UpdateCartItemRequest, CartItem } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private api = environment.apiUrl;

  private _cart = signal<Cart | null>(null);
  readonly cart = this._cart.asReadonly();
  readonly cartItemCount = computed(() => this._cart()?.total_items ?? 0);
  readonly hasItems = computed(() => (this._cart()?.total_items ?? 0) > 0);

  // popup control
  lastAddedItem = signal<CartItem | null>(null);
  showPopup = signal(false);

  constructor(private http: HttpClient) {}

  loadCart(): Observable<Cart> {
    return this.http.get<Cart>(`${this.api}/cart`).pipe(
      tap(cart => this._cart.set(cart))
    );
  }

  addItem(req: AddToCartRequest): Observable<Cart> {
    return this.http.post<Cart>(`${this.api}/cart/items`, req).pipe(
      tap(cart => {
        this._cart.set(cart);
        const item = cart.items.find(i => i.product_id === req.product_id);
        if (item) {
          this.lastAddedItem.set(item);
          this.showPopup.set(true);
          setTimeout(() => this.showPopup.set(false), 3500);
        }
      })
    );
  }

  updateItem(itemId: number, req: UpdateCartItemRequest): Observable<Cart> {
    return this.http.put<Cart>(`${this.api}/cart/items/${itemId}`, req).pipe(
      tap(cart => this._cart.set(cart))
    );
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.api}/cart/items/${itemId}`).pipe(
      tap(cart => this._cart.set(cart))
    );
  }

  clearCart(): void {
    this._cart.set(null);
  }

  dismissPopup(): void {
    this.showPopup.set(false);
  }
}
