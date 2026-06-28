import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-popup',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    @if (cartService.showPopup()) {
      <div class="popup-backdrop" (click)="cartService.dismissPopup()">
        <div class="popup" (click)="$event.stopPropagation()">
          <div class="popup-header">
            <span class="check-icon">✅</span>
            <h3>Added to Cart!</h3>
            <button class="close-btn" (click)="cartService.dismissPopup()">×</button>
          </div>

          @if (cartService.lastAddedItem(); as item) {
            <div class="popup-item">
              <img [src]="item.product_thumbnail || '/assets/images/placeholder.png'"
                   [alt]="item.product_name" class="item-img">
              <div class="item-info">
                <p class="item-name">{{ item.product_name }}</p>
                <p class="item-price">₹{{ item.product_price | number:'1.2-2' }} × {{ item.quantity }}</p>
              </div>
            </div>
          }

          <div class="popup-actions">
            <button class="btn btn-ghost btn-sm" (click)="cartService.dismissPopup()">
              Continue Shopping
            </button>
            <a routerLink="/cart" class="btn btn-primary btn-sm" (click)="cartService.dismissPopup()">
              View Cart ({{ cartService.cartItemCount() }})
            </a>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .popup-backdrop {
      position: fixed;
      inset: 0;
      z-index: 500;
    }

    .popup {
      position: fixed;
      top: 88px;
      right: 24px;
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      padding: 20px;
      width: 320px;
      animation: slideDown 0.25s ease;
      border: 1px solid var(--border-light);
      z-index: 501;
    }

    .popup-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;

      h3 { font-size: 16px; font-weight: 700; flex: 1; font-family: var(--font-body); }
      .check-icon { font-size: 18px; }
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 22px;
      cursor: pointer;
      color: var(--text-muted);
      line-height: 1;
      &:hover { color: var(--text-primary); }
    }

    .popup-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: var(--bg);
      border-radius: var(--radius);
      margin-bottom: 16px;
    }

    .item-img {
      width: 56px;
      height: 56px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      background: var(--border-light);
    }

    .item-info {
      flex: 1;
      .item-name { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
      .item-price { font-size: 13px; color: var(--accent); font-weight: 600; }
    }

    .popup-actions {
      display: flex;
      gap: 8px;
    }
  `]
})
export class CartPopupComponent {
  cartService = inject(CartService);
}
