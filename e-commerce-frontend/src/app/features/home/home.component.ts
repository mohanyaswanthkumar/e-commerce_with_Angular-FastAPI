import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

/**
 * '' route.
 * - Unauthenticated visitors: generic hero/landing promoting login + products.
 * - Authenticated visitors: "auth-homepage" per spec — banner on the left,
 *   with (Order history, Personal details, Start new order / Continue Shopping)
 *   CTAs on the right.
 *
 * "Start new order" vs "Continue Shopping" now reflects the real cart state
 * via CartService.itemCount().
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  constructor(
    readonly auth: AuthService,
    readonly cartService: CartService,
  ) {}
}