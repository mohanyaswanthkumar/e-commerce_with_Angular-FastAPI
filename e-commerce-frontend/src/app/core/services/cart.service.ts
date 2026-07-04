import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiEndpoints } from '../constants/api-endpoints';
import { AddedToCartPopup, AddToCartRequest, Cart } from '../models/cart.model';
import { AuthService } from './auth.service';

/**
 * Mirrors app/routers/cart_router.py — every endpoint here requires login
 * (get_current_user), so callers (PLP/PDP "Add to cart") must check
 * AuthService.isAuthenticated() first and redirect to /login otherwise.
 *
 * Holds the cart as a signal so the header's cart badge and the cart page
 * both read the same live state without re-fetching on every navigation.
 *
 * The "Added to cart" popup (image + price) required by the spec is exposed
 * here as `lastAddedItem`, the same pattern as NotificationService's toast
 * bus — AddedToCartModalComponent (mounted once in AppComponent) just reads
 * this signal and renders itself when it's non-null.
 */
@Injectable({ providedIn: 'root' })
export class CartService {

  private readonly cartSig = signal<Cart | null>(null);
  private readonly lastAddedItemSig = signal<AddedToCartPopup | null>(null);

  readonly cart = computed(() => this.cartSig());
  readonly itemCount = computed(
    () => this.cartSig()?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
  );
  readonly lastAddedItem = computed(() => this.lastAddedItemSig());

  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {
    if (this.auth.isAuthenticated()) {
      this.refreshCart().subscribe();
    }
  }

  refreshCart(): Observable<Cart> {
    return this.http.get<Cart>(ApiEndpoints.cart.get).pipe(
      tap((cart) => this.cartSig.set(cart)),
    );
  }

  /** Adds an item, shows the "Added to cart" popup, and refreshes the cart badge. */
  addToCart(payload: AddToCartRequest): Observable<AddedToCartPopup> {
    return this.http.post<AddedToCartPopup>(ApiEndpoints.cart.addItem, payload).pipe(
      tap((popup) => {
        this.lastAddedItemSig.set(popup);
        this.refreshCart().subscribe();
      }),
    );
  }

  updateItemQuantity(itemId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(ApiEndpoints.cart.updateItem(itemId), { quantity }).pipe(
      tap((cart) => this.cartSig.set(cart)),
    );
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(ApiEndpoints.cart.removeItem(itemId)).pipe(
      tap((cart) => this.cartSig.set(cart)),
    );
  }

  dismissAddedToCartPopup(): void {
    this.lastAddedItemSig.set(null);
  }

  /** Called from AuthService.logout() consumers (header) so the badge clears immediately. */
  clearLocalCart(): void {
    this.cartSig.set(null);
    this.lastAddedItemSig.set(null);
  }
}