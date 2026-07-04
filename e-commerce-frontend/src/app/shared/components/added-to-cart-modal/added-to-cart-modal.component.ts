import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

/**
 * Mounted once in AppComponent. Renders itself whenever
 * CartService.lastAddedItem() is non-null — i.e. right after "Add to cart"
 * on the PLP or PDP, per spec: "added to cart popup should show with
 * product image and price."
 */
@Component({
  selector: 'app-added-to-cart-modal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './added-to-cart-modal.component.html',
  styleUrl: './added-to-cart-modal.component.scss',
})
export class AddedToCartModalComponent {
  constructor(readonly cartService: CartService) {}

  close(): void {
    this.cartService.dismissAddedToCartPopup();
  }
}