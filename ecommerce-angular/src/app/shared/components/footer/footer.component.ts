import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <span class="logo-icon">🛍️</span>
          <span class="logo-text">ShopNow</span>
          <p>Your premier destination for quality products</p>
        </div>

        <div class="footer-links">
          <div class="link-group">
            <h4>Shop</h4>
            <a routerLink="/products">All Products</a>
            <a routerLink="/wishlist">Wishlist</a>
            <a routerLink="/cart">Cart</a>
          </div>
          <div class="link-group">
            <h4>Account</h4>
            <a routerLink="/profile/account-details">Profile</a>
            <a routerLink="/orders">Orders</a>
            <a routerLink="/profile/addresses">Addresses</a>
          </div>
          <div class="link-group">
            <h4>Help</h4>
            <a href="#">FAQ</a>
            <a href="#">Contact Us</a>
            <a href="#">Returns</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© {{ year }} ShopNow. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--primary);
      color: rgba(255,255,255,0.75);
      padding-top: 48px;
    }

    .footer-inner {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 48px;
      padding-bottom: 40px;
    }

    .footer-brand {
      .logo-icon { font-size: 32px; display: block; margin-bottom: 8px; }
      .logo-text {
        font-family: var(--font-display);
        font-size: 22px;
        font-weight: 700;
        color: white;
        display: block;
        margin-bottom: 10px;
      }
      p { font-size: 14px; line-height: 1.6; }
    }

    .footer-links {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .link-group {
      h4 {
        color: white;
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 14px;
        font-family: var(--font-body);
      }

      a {
        display: block;
        font-size: 14px;
        margin-bottom: 8px;
        transition: color var(--transition);
        text-decoration: none;
        &:hover { color: white; }
      }
    }

    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.1);
      padding: 16px 0;
      text-align: center;
      font-size: 13px;
    }

    @media (max-width: 768px) {
      .footer-inner { grid-template-columns: 1fr; gap: 32px; }
      .footer-links { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}
