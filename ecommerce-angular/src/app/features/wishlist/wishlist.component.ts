import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../shared/models';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private toast = inject(ToastService);

  products = signal<Product[]>([]);
  loading = signal(true);
  addingToCart: Record<number, boolean> = {};

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.productService.getWishlist().subscribe({
      next: data => { this.products.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load wishlist'); }
    });
  }

  removeFromWishlist(product: Product): void {
    this.productService.toggleWishlist(product.id).subscribe({
      next: () => {
        this.products.update(list => list.filter(p => p.id !== product.id));
        this.toast.success('Removed from wishlist');
      }
    });
  }

  addToCart(product: Product): void {
    this.addingToCart[product.id] = true;
    this.cartService.addItem({ product_id: product.id, quantity: 1 }).subscribe({
      next: () => { this.addingToCart[product.id] = false; },
      error: (e) => { this.addingToCart[product.id] = false; this.toast.error(e.error?.detail || 'Failed to add to cart'); }
    });
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/images/placeholder.png';
  }
}
