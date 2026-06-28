import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../shared/models';

@Component({
  selector: 'app-pdp',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <div class="page-content">
      <div class="container">

        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <a routerLink="/products">Products</a>
          <span>›</span>
          @if (product()) {
            <span class="bc-current">{{ product()!.name }}</span>
          }
        </div>

        @if (loading()) {
          <div class="loading-overlay"><div class="spinner"></div></div>
        } @else if (!product()) {
          <div class="empty-state">
            <div class="empty-icon">😕</div>
            <h3>Product Not Found</h3>
            <a routerLink="/products" class="btn btn-primary">Browse Products</a>
          </div>
        } @else {
          <div class="pdp-grid">

            <!-- Left: Images -->
            <div class="pdp-images">
              <div class="main-image-wrap">
                <img [src]="activeImage()" [alt]="product()!.name" class="main-image"
                     (error)="onImgError($event)">
                @if (!product()!.is_in_stock) {
                  <div class="oos-badge">Out of Stock</div>
                }
              </div>

              @if (product()!.images?.length > 1) {
                <div class="thumbnails">
                  @for (img of product()!.images; track $index) {
                    <button class="thumb-btn" [class.active]="activeImage() === img"
                            (click)="activeImage.set(img)">
                      <img [src]="img" [alt]="'Image ' + ($index + 1)" (error)="onImgError($event)">
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Right: Details -->
            <div class="pdp-details">

              <!-- Category + Brand -->
              <div class="pdp-meta">
                <span class="meta-cat">{{ product()!.category }}</span>
                @if (product()!.brand) {
                  <span class="meta-sep">·</span>
                  <span class="meta-brand">{{ product()!.brand }}</span>
                }
              </div>

              <h1 class="pdp-title">{{ product()!.name }}</h1>

              <!-- Rating -->
              @if (product()!.rating) {
                <div class="pdp-rating">
                  <div class="stars">
                    @for (s of starsArray(product()!.rating!); track $index) {
                      <span>{{ s }}</span>
                    }
                  </div>
                  <span class="rating-num">{{ product()!.rating?.toFixed(1) }}</span>
                  <span class="review-count">({{ product()!.review_count }} reviews)</span>
                </div>
              }

              <!-- Price -->
              <div class="pdp-price">
                <span class="price" style="font-size: 32px">₹{{ product()!.price | number:'1.2-2' }}</span>
                @if (product()!.original_price && product()!.original_price! > product()!.price) {
                  <span class="price-original" style="font-size: 18px">₹{{ product()!.original_price | number:'1.2-2' }}</span>
                  <span class="discount-badge">
                    {{ getDiscount(product()!.price, product()!.original_price!) }}% OFF
                  </span>
                }
              </div>

              <!-- Stock Status -->
              <div class="stock-badge" [class.in-stock]="product()!.is_in_stock" [class.out-stock]="!product()!.is_in_stock">
                @if (product()!.is_in_stock) {
                  ✅ In Stock
                  @if (product()!.stock_quantity <= 10) {
                    <span class="low-stock"> — Only {{ product()!.stock_quantity }} left!</span>
                  }
                } @else {
                  ❌ Out of Stock
                }
              </div>

              <div class="divider"></div>

              <!-- Short Description -->
              @if (product()!.short_description) {
                <p class="short-desc">{{ product()!.short_description }}</p>
              }

              <!-- SKU -->
              <p class="sku-line">SKU: <strong>{{ product()!.sku }}</strong>
                @if (product()!.sap_material_number) {
                  · SAP Material: <strong>{{ product()!.sap_material_number }}</strong>
                }
              </p>

              <!-- Tags -->
              @if (product()!.tags?.length) {
                <div class="tags">
                  @for (tag of product()!.tags; track tag) {
                    <span class="tag">{{ tag }}</span>
                  }
                </div>
              }

              <div class="divider"></div>

              <!-- Quantity + Actions -->
              <div class="pdp-actions">
                <div class="qty-selector">
                  <button (click)="decQty()" [disabled]="qty() <= 1">−</button>
                  <input type="number" [value]="qty()" min="1" max="99"
                         (change)="qty.set(+($event.target as HTMLInputElement).value)">
                  <button (click)="incQty()" [disabled]="qty() >= 99">+</button>
                </div>

                <button class="btn btn-primary btn-lg" style="flex:1"
                        [disabled]="!product()!.is_in_stock || addingToCart()"
                        (click)="addToCart()">
                  @if (addingToCart()) { <span class="spinner spinner-sm"></span> }
                  @else if (!product()!.is_in_stock) { Out of Stock }
                  @else { Add to Cart }
                </button>

                <button class="wishlist-btn" [class.active]="product()!.is_wishlisted"
                        (click)="toggleWishlist()" title="Add to Wishlist">
                  <svg viewBox="0 0 24 24" [attr.fill]="product()!.is_wishlisted ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>

              <!-- Delivery Info -->
              <div class="delivery-info">
                <div class="delivery-item">🚚 <span>Free delivery on orders above ₹499</span></div>
                <div class="delivery-item">🔄 <span>30-day easy returns</span></div>
                <div class="delivery-item">🔐 <span>Secure payment guaranteed</span></div>
              </div>
            </div>
          </div>

          <!-- Description + Specifications Tabs -->
          <div class="pdp-tabs card" style="margin-top: 32px">
            <div class="tabs">
              <button class="tab-btn" [class.active]="activeTab() === 'desc'" (click)="activeTab.set('desc')">Description</button>
              @if (product()!.specifications && objectKeys(product()!.specifications!).length > 0) {
                <button class="tab-btn" [class.active]="activeTab() === 'specs'" (click)="activeTab.set('specs')">Specifications</button>
              }
            </div>

            @if (activeTab() === 'desc') {
              <div class="tab-content">
                <p style="line-height:1.8; color: var(--text-secondary)">{{ product()!.description }}</p>
              </div>
            } @else {
              <div class="tab-content">
                <table class="spec-table">
                  @for (key of objectKeys(product()!.specifications!); track key) {
                    <tr>
                      <td class="spec-key">{{ key }}</td>
                      <td class="spec-val">{{ product()!.specifications![key] }}</td>
                    </tr>
                  }
                </table>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .breadcrumb {
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 13px;
      margin-bottom: 28px;
      color: var(--text-secondary);
      a { color: var(--accent); text-decoration: none; &:hover { text-decoration: underline; } }
      .bc-current { color: var(--text-primary); font-weight: 600; }
    }

    .pdp-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: start;
    }

    /* Images */
    .main-image-wrap {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--bg);
      border: 1px solid var(--border-light);
    }

    .main-image {
      width: 100%;
      height: 480px;
      object-fit: contain;
      background: #f8f9fa;
    }

    .oos-badge {
      position: absolute;
      top: 16px;
      left: 16px;
      background: rgba(0,0,0,0.75);
      color: white;
      padding: 6px 14px;
      border-radius: 50px;
      font-size: 13px;
      font-weight: 700;
    }

    .thumbnails {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      flex-wrap: wrap;
    }

    .thumb-btn {
      width: 72px;
      height: 72px;
      border-radius: var(--radius);
      border: 2px solid var(--border-light);
      overflow: hidden;
      cursor: pointer;
      padding: 0;
      background: none;
      transition: border-color var(--transition);

      img { width: 100%; height: 100%; object-fit: cover; }
      &.active { border-color: var(--accent); }
      &:hover { border-color: var(--accent); }
    }

    /* Details */
    .pdp-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 13px;
    }

    .meta-cat { background: var(--border-light); padding: 3px 10px; border-radius: 50px; font-weight: 600; color: var(--text-secondary); }
    .meta-sep { color: var(--text-muted); }
    .meta-brand { color: var(--text-secondary); font-weight: 500; }

    .pdp-title { font-size: 28px; margin-bottom: 12px; }

    .pdp-rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      .rating-num { font-weight: 700; font-size: 14px; }
      .review-count { font-size: 13px; color: var(--text-muted); }
    }

    .pdp-price {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .discount-badge {
      background: rgba(34,197,94,0.1);
      color: var(--success);
      padding: 3px 10px;
      border-radius: 50px;
      font-size: 13px;
      font-weight: 700;
    }

    .stock-badge {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
      &.in-stock { color: var(--success); }
      &.out-stock { color: var(--danger); }
      .low-stock { font-weight: 400; color: var(--warning); }
    }

    .short-desc {
      color: var(--text-secondary);
      font-size: 15px;
      line-height: 1.7;
      margin-bottom: 12px;
    }

    .sku-line {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 12px;
      strong { color: var(--text-secondary); }
    }

    .tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 4px;
    }

    .tag {
      background: var(--border-light);
      color: var(--text-secondary);
      padding: 4px 12px;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 500;
    }

    .pdp-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .delivery-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .delivery-item {
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 13px;
      color: var(--text-secondary);
    }

    /* Tabs */
    .tab-content { padding-top: 8px; }

    .spec-table {
      width: 100%;
      border-collapse: collapse;
      tr { border-bottom: 1px solid var(--border-light); }
      td { padding: 12px 16px; font-size: 14px; }
      .spec-key { color: var(--text-secondary); font-weight: 600; width: 200px; background: var(--bg); }
      .spec-val { color: var(--text-primary); }
    }

    @media (max-width: 900px) {
      .pdp-grid { grid-template-columns: 1fr; }
      .main-image { height: 320px; }
    }
  `]
})
export class PdpComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  product = signal<Product | null>(null);
  loading = signal(true);
  activeImage = signal('');
  qty = signal(1);
  addingToCart = signal(false);
  activeTab = signal<'desc' | 'specs'>('desc');

  objectKeys = Object.keys;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProduct(id).subscribe({
      next: p => {
        this.product.set(p);
        this.activeImage.set(p.thumbnail || (p.images?.[0] ?? ''));
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  incQty(): void { this.qty.update(v => Math.min(v + 1, 99)); }
  decQty(): void { this.qty.update(v => Math.max(v - 1, 1)); }

  addToCart(): void {
    if (!this.authService.isLoggedIn()) { this.toast.info('Please login first'); return; }
    this.addingToCart.set(true);
    this.cartService.addItem({ product_id: this.product()!.id, quantity: this.qty() }).subscribe({
      next: () => this.addingToCart.set(false),
      error: (e) => { this.addingToCart.set(false); this.toast.error(e.error?.detail || 'Failed to add'); }
    });
  }

  toggleWishlist(): void {
    if (!this.authService.isLoggedIn()) { this.toast.info('Please login first'); return; }
    this.productService.toggleWishlist(this.product()!.id).subscribe({
      next: (res) => {
        this.product.update(p => p ? { ...p, is_wishlisted: res.is_wishlisted } : p);
        this.toast.success(res.message);
      }
    });
  }

  getDiscount(price: number, original: number): number {
    return Math.round((1 - price / original) * 100);
  }

  starsArray(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating) ? '⭐' : '☆');
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/images/placeholder.png';
  }
}
