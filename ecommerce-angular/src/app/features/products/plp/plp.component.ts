import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, ProductFilterParams } from '../../../shared/models';

@Component({
  selector: 'app-plp',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <div class="page-content">
      <div class="container">
        <!-- Page Header -->
        <div class="plp-header">
          <div>
            <h1 class="section-title" style="margin-bottom: 4px">All Products</h1>
            <p class="result-count" *ngIf="!loading()">
              Showing {{ products().length }} of {{ total() }} products
            </p>
          </div>

          <!-- Search Bar -->
          <div class="search-bar" style="width: 320px">
            <span class="search-icon">🔍</span>
            <input type="text" [(ngModel)]="searchTerm"
                   (input)="onSearch()"
                   placeholder="Search products...">
          </div>
        </div>

        <div class="plp-layout">
          <!-- Sidebar Filters -->
          <aside class="filter-sidebar card">
            <h3 class="filter-title">Filters</h3>

            <!-- Category -->
            <div class="filter-group">
              <label class="filter-label">Category</label>
              <select class="form-control" [(ngModel)]="filters.category" (change)="applyFilters()">
                <option value="">All Categories</option>
                @for (cat of categories(); track cat) {
                  <option [value]="cat">{{ cat }}</option>
                }
              </select>
            </div>

            <!-- Price Range -->
            <div class="filter-group">
              <label class="filter-label">Price Range</label>
              <div class="price-range">
                <input type="number" class="form-control" [(ngModel)]="filters.min_price"
                       placeholder="Min" (change)="applyFilters()">
                <span style="color: var(--text-muted)">–</span>
                <input type="number" class="form-control" [(ngModel)]="filters.max_price"
                       placeholder="Max" (change)="applyFilters()">
              </div>
            </div>

            <!-- In Stock Only -->
            <div class="filter-group">
              <label class="filter-check">
                <input type="checkbox" [(ngModel)]="filters.in_stock_only" (change)="applyFilters()">
                In Stock Only
              </label>
            </div>

            <!-- Sort -->
            <div class="filter-group">
              <label class="filter-label">Sort By</label>
              <select class="form-control" [(ngModel)]="filters.sort_by" (change)="applyFilters()">
                <option value="">Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            <button class="btn btn-ghost btn-full btn-sm" (click)="clearFilters()">
              Clear All Filters
            </button>
          </aside>

          <!-- Product Grid -->
          <div class="product-area">
            @if (loading()) {
              <div class="loading-overlay">
                <div class="spinner"></div>
              </div>
            } @else if (products().length === 0) {
              <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>No Products Found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button class="btn btn-outline" (click)="clearFilters()">Clear Filters</button>
              </div>
            } @else {
              <div class="product-grid">
                @for (product of products(); track product.id) {
                  <div class="product-card">
                    <!-- Wishlist -->
                    <button class="wishlist-btn" [class.active]="product.is_wishlisted"
                            (click)="toggleWishlist(product, $event)"
                            [disabled]="!authService.isLoggedIn()">
                      <svg viewBox="0 0 24 24" [attr.fill]="product.is_wishlisted ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>

                    <!-- Product Image -->
                    <a [routerLink]="['/products', product.id]" class="product-img-link">
                      <img [src]="product.thumbnail || '/assets/images/placeholder.png'"
                           [alt]="product.name" class="product-img"
                           (error)="onImgError($event)">
                      @if (!product.is_in_stock) {
                        <div class="out-of-stock-overlay">Out of Stock</div>
                      }
                    </a>

                    <!-- Product Info -->
                    <div class="product-body">
                      <p class="product-category">{{ product.category }}</p>
                      <a [routerLink]="['/products', product.id]" class="product-name">{{ product.name }}</a>

                      @if (product.rating) {
                        <div class="product-rating">
                          <div class="stars">
                            @for (s of starsArray(product.rating); track $index) {
                              <span>{{ s }}</span>
                            }
                          </div>
                          <span class="rating-count">({{ product.review_count }})</span>
                        </div>
                      }

                      <div class="product-price-row">
                        <div>
                          <span class="price">₹{{ product.price | number:'1.2-2' }}</span>
                          @if (product.original_price && product.original_price > product.price) {
                            <span class="price-original">₹{{ product.original_price | number:'1.2-2' }}</span>
                          }
                        </div>
                      </div>

                      <!-- Quantity + Add to Cart -->
                      <div class="product-actions">
                        <div class="qty-selector">
                          <button (click)="decQty(product)" [disabled]="getQty(product) <= 1">−</button>
                          <input type="number" [value]="getQty(product)" min="1" max="99"
                                 (change)="setQty(product, $event)">
                          <button (click)="incQty(product)" [disabled]="getQty(product) >= 99">+</button>
                        </div>

                        <button class="btn btn-primary btn-sm"
                                [disabled]="!product.is_in_stock || addingToCart[product.id]"
                                (click)="addToCart(product)">
                          @if (addingToCart[product.id]) {
                            <span class="spinner spinner-sm"></span>
                          } @else if (!product.is_in_stock) {
                            Out of Stock
                          } @else {
                            + Cart
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Pagination -->
              @if (totalPages() > 1) {
                <div class="pagination">
                  <button [disabled]="currentPage() === 1" (click)="goToPage(currentPage() - 1)">‹</button>
                  @for (p of pageNumbers(); track p) {
                    <button [class.active]="p === currentPage()" (click)="goToPage(p)">{{ p }}</button>
                  }
                  <button [disabled]="currentPage() === totalPages()" (click)="goToPage(currentPage() + 1)">›</button>
                </div>
              }
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .plp-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }

    .result-count { font-size: 13px; color: var(--text-secondary); }

    .plp-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 28px;
      align-items: start;
    }

    .filter-sidebar {
      padding: 20px;
      position: sticky;
      top: 90px;
    }

    .filter-title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 20px;
      font-family: var(--font-body);
    }

    .filter-group { margin-bottom: 20px; }
    .filter-label { display: block; font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .price-range { display: flex; gap: 8px; align-items: center; }
    .filter-check { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; input { width: 16px; height: 16px; accent-color: var(--accent); } }

    /* Product Grid */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }

    .product-card {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1.5px solid var(--border-light);
      overflow: hidden;
      transition: all var(--transition-slow);
      position: relative;

      &:hover {
        box-shadow: var(--shadow-lg);
        border-color: var(--border);
        transform: translateY(-2px);
      }
    }

    .wishlist-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 2;
      background: white;
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition);
      color: var(--text-muted);

      svg { width: 18px; height: 18px; }
      &.active { color: var(--accent); }
      &:hover { color: var(--accent); box-shadow: var(--shadow); }
    }

    .product-img-link { display: block; position: relative; }
    .product-img { width: 100%; height: 200px; object-fit: cover; background: var(--bg); }

    .out-of-stock-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.55);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 0.05em;
    }

    .product-body { padding: 14px; }
    .product-category { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
    .product-name { display: block; font-size: 14px; font-weight: 600; color: var(--text-primary); text-decoration: none; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; &:hover { color: var(--accent); } }

    .product-rating { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
    .rating-count { font-size: 11px; color: var(--text-muted); }

    .product-price-row { margin-bottom: 12px; }

    .product-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    @media (max-width: 1024px) {
      .plp-layout { grid-template-columns: 1fr; }
      .filter-sidebar { position: static; }
    }

    @media (max-width: 600px) {
      .product-grid { grid-template-columns: repeat(2, 1fr); }
      .plp-header { flex-direction: column; align-items: flex-start; }
      .search-bar { width: 100% !important; }
    }
  `]
})
export class PlpComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  authService = inject(AuthService);
  private toast = inject(ToastService);

  products = signal<Product[]>([]);
  categories = signal<string[]>([]);
  loading = signal(false);
  total = signal(0);
  currentPage = signal(1);
  pageSize = 12;

  totalPages = computed(() => Math.ceil(this.total() / this.pageSize));
  pageNumbers = computed(() => {
    const pages: number[] = [];
    const total = this.totalPages();
    const current = this.currentPage();
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  filters: ProductFilterParams = {};
  searchTerm = '';
  searchTimeout?: ReturnType<typeof setTimeout>;
  quantities: Record<number, number> = {};
  addingToCart: Record<number, boolean> = {};

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.loading.set(true);
    const params: ProductFilterParams = {
      ...this.filters,
      search: this.searchTerm || undefined,
      page: this.currentPage(),
      page_size: this.pageSize
    };

    this.productService.getProducts(params).subscribe({
      next: res => {
        this.products.set(res.items);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load products');
      }
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: cats => this.categories.set(cats),
      error: () => {}
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadProducts();
    }, 400);
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  clearFilters(): void {
    this.filters = {};
    this.searchTerm = '';
    this.currentPage.set(1);
    this.loadProducts();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getQty(product: Product): number {
    return this.quantities[product.id] ?? 1;
  }

  incQty(product: Product): void {
    this.quantities[product.id] = Math.min((this.quantities[product.id] ?? 1) + 1, 99);
  }

  decQty(product: Product): void {
    this.quantities[product.id] = Math.max((this.quantities[product.id] ?? 1) - 1, 1);
  }

  setQty(product: Product, event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value);
    if (!isNaN(val) && val >= 1) this.quantities[product.id] = Math.min(val, 99);
  }

  addToCart(product: Product): void {
    if (!this.authService.isLoggedIn()) {
      this.toast.info('Please login to add items to cart');
      return;
    }
    this.addingToCart[product.id] = true;
    this.cartService.addItem({ product_id: product.id, quantity: this.getQty(product) }).subscribe({
      next: () => {
        this.addingToCart[product.id] = false;
      },
      error: (err) => {
        this.addingToCart[product.id] = false;
        this.toast.error(err.error?.detail || 'Failed to add to cart');
      }
    });
  }

  toggleWishlist(product: Product, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) { this.toast.info('Login to save to wishlist'); return; }
    this.productService.toggleWishlist(product.id).subscribe({
      next: (res) => {
        product.is_wishlisted = res.is_wishlisted;
        this.toast.success(res.message);
      }
    });
  }

  starsArray(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating) ? '⭐' : '☆');
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/images/placeholder.png';
  }
}
