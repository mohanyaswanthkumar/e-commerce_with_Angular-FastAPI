import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ProductDetail } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';

/** Product Detail Page — reached by clicking a product image on the PLP. */
@Component({
  selector: 'app-pdp',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pdp.component.html',
  styleUrl: './pdp.component.scss',
})
export class PdpComponent implements OnInit, OnDestroy {
  readonly product = signal<ProductDetail | null>(null);
  readonly isLoading = signal(true);
  readonly notFound = signal(false);
  readonly quantity = signal(1);
  readonly isAdding = signal(false);
  readonly isTogglingWishlist = signal(false);

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productService: ProductService,
    private readonly cartService: CartService,
    readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          this.isLoading.set(true);
          this.notFound.set(false);
          this.quantity.set(1);
          return this.productService.getPdp(Number(params.get('id')));
        }),
      )
      .subscribe({
        next: (product) => {
          this.product.set(product);
          this.isLoading.set(false);
        },
        error: () => {
          this.notFound.set(true);
          this.isLoading.set(false);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeQuantity(delta: number): void {
    this.quantity.update((q) => Math.max(1, q + delta));
  }

  setQuantity(value: string): void {
    this.quantity.set(Math.max(1, Number(value) || 1));
  }

  addToCart(): void {
    const product = this.product();
    if (!product) return;

    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/products/${product.id}` } });
      return;
    }
    if (!product.is_in_stock) return;

    this.isAdding.set(true);
    this.cartService.addToCart({ product_id: product.id, quantity: this.quantity() }).subscribe({
      next: () => this.isAdding.set(false),
      error: () => this.isAdding.set(false),
    });
  }

  toggleWishlist(): void {
    const product = this.product();
    if (!product) return;

    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/products/${product.id}` } });
      return;
    }

    this.isTogglingWishlist.set(true);
    this.productService.toggleWishlist(product.id).subscribe({
      next: (res) => {
        this.product.update((p) => (p ? { ...p, is_wishlisted: res.is_wishlisted } : p));
        this.isTogglingWishlist.set(false);
      },
      error: () => this.isTogglingWishlist.set(false),
    });
  }
}