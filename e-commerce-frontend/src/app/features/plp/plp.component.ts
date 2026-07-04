import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { ProductCard } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';

/**
 * Product Listing Page: product cards (image, wishlist-icon, quantity box,
 * add to cart, price). Clicking a product image navigates to the PDP.
 * Reads `search` from the query string — the header's dynamic search bar
 * navigates here with `?search=...`.
 */
@Component({
  selector: 'app-plp',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './plp.component.html',
  styleUrl: './plp.component.scss',
})
export class PlpComponent implements OnInit, OnDestroy {
  readonly products = signal<ProductCard[]>([]);
  readonly isLoading = signal(true);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = 20;
  readonly searchTerm = signal<string | null>(null);
  readonly addingProductId = signal<number | null>(null);
  readonly togglingWishlistId = signal<number | null>(null);

  private readonly destroy$ = new Subject<void>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total() / this.pageSize));
  }

  constructor(
    private readonly productService: ProductService,
    private readonly cartService: CartService,
    private readonly notifications: NotificationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.searchTerm.set(params.get('search'));
      this.page.set(Number(params.get('page') ?? 1));
      this.fetchProducts();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchProducts(): void {
    this.isLoading.set(true);
    this.productService
      .getPlp({ search: this.searchTerm(), page: this.page(), page_size: this.pageSize })
      .subscribe({
        next: (res) => {
          this.products.set(res.items.map((p) => ({ ...p, selectedQuantity: 1 })));
          this.total.set(res.total);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page, search: this.searchTerm() || null },
      queryParamsHandling: 'merge',
    });
  }

  setQuantity(product: ProductCard, value: string): void {
    const qty = Math.max(1, Number(value) || 1);
    this.products.update((list) =>
      list.map((p) => (p.id === product.id ? { ...p, selectedQuantity: qty } : p)),
    );
  }

  addToCart(product: ProductCard): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/products' } });
      return;
    }
    if (!product.is_in_stock) return;

    this.addingProductId.set(product.id);
    this.cartService
      .addToCart({ product_id: product.id, quantity: product.selectedQuantity || 1 })
      .subscribe({
        next: () => this.addingProductId.set(null),
        error: () => this.addingProductId.set(null),
      });
  }

  toggleWishlist(product: ProductCard): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/products' } });
      return;
    }

    this.togglingWishlistId.set(product.id);
    this.productService.toggleWishlist(product.id).subscribe({
      next: (res) => {
        this.products.update((list) =>
          list.map((p) => (p.id === product.id ? { ...p, is_wishlisted: res.is_wishlisted } : p)),
        );
        this.togglingWishlistId.set(null);
      },
      error: () => this.togglingWishlistId.set(null),
    });
  }
}