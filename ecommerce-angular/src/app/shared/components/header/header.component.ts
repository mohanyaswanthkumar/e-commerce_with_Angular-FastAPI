import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <header class="header">
      <div class="container header-inner">

        <!-- Logo -->
        <a routerLink="/" class="logo">
          <span class="logo-icon">🛍️</span>
          <span class="logo-text">ShopNow</span>
        </a>

        <!-- Center Nav -->
        <nav class="nav-center">
          <a routerLink="/products" routerLinkActive="active" class="nav-link">Products</a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/home" routerLinkActive="active" class="nav-link">Home</a>
          }
        </nav>

        <!-- Right Side Actions -->
        <div class="nav-right">
          @if (!auth.isLoggedIn()) {
            <a routerLink="/login" class="btn btn-outline btn-sm">Sign In</a>
          } @else {
            <!-- Wishlist -->
            <a routerLink="/wishlist" class="icon-btn" title="Wishlist">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </a>

            <!-- Cart -->
            <a routerLink="/cart" class="icon-btn cart-btn" title="Cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              @if (cartService.cartItemCount() > 0) {
                <span class="cart-badge">{{ cartService.cartItemCount() }}</span>
              }
            </a>

            <!-- User Dropdown -->
            <div class="user-dropdown" [class.open]="dropdownOpen()">
              <button class="user-btn" (click)="toggleDropdown()">
                <span class="user-avatar">{{ userInitial() }}</span>
                <span class="user-name">Hi, {{ firstName() }}</span>
                <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [style.transform]="dropdownOpen() ? 'rotate(180deg)' : ''">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              @if (dropdownOpen()) {
                <div class="dropdown-menu" (click)="$event.stopPropagation()">
                  <!-- My Orders -->
                  <div class="dropdown-section">
                    <span class="dropdown-label">My Orders</span>
                    <a routerLink="/orders" class="dropdown-item" (click)="closeDropdown()">
                      <span>📋</span> Order History
                    </a>
                    <a routerLink="/orders/tracking" class="dropdown-item" (click)="closeDropdown()">
                      <span>📦</span> Track My Order
                    </a>
                  </div>

                  <!-- My Profile -->
                  <div class="dropdown-section">
                    <span class="dropdown-label">My Profile</span>
                    <a routerLink="/profile/account-details" class="dropdown-item" (click)="closeDropdown()">
                      <span>👤</span> Account Details
                    </a>
                    <a routerLink="/profile/change-password" class="dropdown-item" (click)="closeDropdown()">
                      <span>🔒</span> Change Password
                    </a>
                  </div>

                  <!-- Payment Information -->
                  <div class="dropdown-section">
                    <span class="dropdown-label">Payment Information</span>
                    <a routerLink="/profile/payments/preference" class="dropdown-item" (click)="closeDropdown()">
                      <span>💳</span> Default Payment
                    </a>
                    <a routerLink="/profile/payments/credit-cards" class="dropdown-item" (click)="closeDropdown()">
                      <span>🃏</span> Credit Cards
                    </a>
                  </div>

                  <!-- Addresses -->
                  <div class="dropdown-section">
                    <span class="dropdown-label">Addresses</span>
                    <a routerLink="/profile/addresses" class="dropdown-item" (click)="closeDropdown()">
                      <span>📍</span> My Addresses
                    </a>
                  </div>

                  @if (auth.isAdmin()) {
                    <div class="dropdown-section">
                      <span class="dropdown-label">Admin</span>
                      <a routerLink="/admin" class="dropdown-item" (click)="closeDropdown()">
                        <span>⚙️</span> Admin Dashboard
                      </a>
                    </div>
                  }

                  <div class="dropdown-divider"></div>
                  <button class="dropdown-item logout-item" (click)="logout()">
                    <span>🚪</span> Logout
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--primary);
      box-shadow: 0 2px 20px rgba(0,0,0,0.2);
      height: 72px;
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }

    .logo-icon { font-size: 26px; }

    .logo-text {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 700;
      color: white;
      letter-spacing: -0.02em;
    }

    .nav-center {
      display: flex;
      gap: 4px;
    }

    .nav-link {
      padding: 8px 18px;
      color: rgba(255,255,255,0.75);
      font-size: 14px;
      font-weight: 500;
      border-radius: var(--radius);
      transition: all var(--transition);
      text-decoration: none;

      &:hover, &.active { background: rgba(255,255,255,0.12); color: white; }
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .icon-btn {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.8);
      transition: all var(--transition);
      cursor: pointer;
      text-decoration: none;

      svg { width: 22px; height: 22px; }
      &:hover { background: rgba(255,255,255,0.12); color: white; }
    }

    .cart-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background: var(--accent);
      color: white;
      font-size: 10px;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }

    .user-dropdown { position: relative; }

    .user-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: var(--radius);
      background: rgba(255,255,255,0.1);
      color: white;
      border: 1px solid rgba(255,255,255,0.15);
      cursor: pointer;
      transition: all var(--transition);
      font-size: 14px;
      font-weight: 500;

      &:hover { background: rgba(255,255,255,0.15); }
    }

    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--accent);
      color: white;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chevron {
      width: 16px;
      height: 16px;
      transition: transform 0.2s ease;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      min-width: 240px;
      padding: 8px;
      animation: slideDown 0.15s ease;
      border: 1px solid var(--border-light);
      z-index: 200;
    }

    .dropdown-section {
      padding: 4px 0;
      border-bottom: 1px solid var(--border-light);
      margin-bottom: 4px;
    }

    .dropdown-label {
      display: block;
      padding: 4px 12px 6px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      font-size: 14px;
      color: var(--text-primary);
      border-radius: var(--radius-sm);
      transition: background var(--transition);
      text-decoration: none;
      cursor: pointer;
      width: 100%;
      background: none;
      border: none;
      font-family: inherit;
      text-align: left;

      &:hover { background: var(--bg); }
    }

    .logout-item { color: var(--danger); }

    .dropdown-divider {
      height: 1px;
      background: var(--border-light);
      margin: 4px 0;
    }

    @media (max-width: 768px) {
      .user-name { display: none; }
      .nav-center .nav-link:not([routerLink="/products"]) { display: none; }
    }
  `]
})
export class HeaderComponent {
  auth = inject(AuthService);
  cartService = inject(CartService);
  private router = inject(Router);

  dropdownOpen = signal(false);

  userInitial = () => {
    const u = this.auth.user();
    return u ? u.first_name[0].toUpperCase() : '?';
  };

  firstName = () => this.auth.user()?.first_name ?? '';

  toggleDropdown(): void { this.dropdownOpen.update(v => !v); }
  closeDropdown(): void { this.dropdownOpen.set(false); }

  @HostListener('document:click')
  onDocClick(): void { this.dropdownOpen.set(false); }

  logout(): void {
    this.closeDropdown();
    this.auth.logout();
  }
}
