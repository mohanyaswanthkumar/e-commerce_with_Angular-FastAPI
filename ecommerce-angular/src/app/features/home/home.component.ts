import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="page-content">
      <div class="container">
        <div class="home-grid">
          <!-- Banner / Left -->
          <div class="home-banner">
            <div class="banner-content">
              <p class="banner-eyebrow">Welcome Back</p>
              <h1 class="banner-title">
                Hello, <br>
                <span class="accent-name">{{ auth.user()?.first_name }}</span>! 👋
              </h1>
              <p class="banner-subtitle">
                Discover thousands of products at unbeatable prices.
                Your next great find is just a click away.
              </p>
              <div class="banner-stats">
                <div class="stat">
                  <span class="stat-number">10K+</span>
                  <span class="stat-label">Products</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat">
                  <span class="stat-number">500+</span>
                  <span class="stat-label">Brands</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat">
                  <span class="stat-number">24hr</span>
                  <span class="stat-label">Delivery</span>
                </div>
              </div>
            </div>
            <div class="banner-decoration">
              <div class="circle c1"></div>
              <div class="circle c2"></div>
              <div class="circle c3"></div>
              <span class="banner-emoji">🛒</span>
            </div>
          </div>

          <!-- Right CTAs -->
          <div class="home-ctas">
            <!-- Order History -->
            <a routerLink="/orders" class="cta-card">
              <div class="cta-icon" style="background: rgba(233,69,96,0.1); color: var(--accent)">📋</div>
              <div class="cta-info">
                <h3>Order History</h3>
                <p>View and track all your past orders</p>
              </div>
              <span class="cta-arrow">→</span>
            </a>

            <!-- Personal Details -->
            <a routerLink="/profile/account-details" class="cta-card">
              <div class="cta-icon" style="background: rgba(59,130,246,0.1); color: var(--info)">👤</div>
              <div class="cta-info">
                <h3>Personal Details</h3>
                <p>Manage your profile and preferences</p>
              </div>
              <span class="cta-arrow">→</span>
            </a>

            <!-- Cart / Shop CTA (dynamic) -->
            @if (cartService.hasItems()) {
              <a routerLink="/cart" class="cta-card cta-primary">
                <div class="cta-icon" style="background: rgba(34,197,94,0.15); color: var(--success)">🛒</div>
                <div class="cta-info">
                  <h3>Continue Shopping</h3>
                  <p>{{ cartService.cartItemCount() }} item(s) in your cart</p>
                </div>
                <span class="cta-badge">{{ cartService.cartItemCount() }}</span>
              </a>
            } @else {
              <a routerLink="/products" class="cta-card cta-primary">
                <div class="cta-icon" style="background: rgba(233,69,96,0.15); color: var(--accent)">🚀</div>
                <div class="cta-info">
                  <h3>Start New Order</h3>
                  <p>Browse our latest products</p>
                </div>
                <span class="cta-arrow">→</span>
              </a>
            }

            <!-- Wishlist -->
            <a routerLink="/wishlist" class="cta-card">
              <div class="cta-icon" style="background: rgba(245,158,11,0.1); color: var(--warning)">❤️</div>
              <div class="cta-info">
                <h3>Wishlist</h3>
                <p>Items you've saved for later</p>
              </div>
              <span class="cta-arrow">→</span>
            </a>

            @if (auth.isAdmin()) {
              <a routerLink="/admin" class="cta-card cta-admin">
                <div class="cta-icon" style="background: rgba(139,92,246,0.1); color: #7c3aed">⚙️</div>
                <div class="cta-info">
                  <h3>Admin Dashboard</h3>
                  <p>Manage products, users, and orders</p>
                </div>
                <span class="cta-arrow">→</span>
              </a>
            }
          </div>
        </div>

        <!-- Feature Highlights -->
        <div class="features-row">
          <div class="feature">
            <span class="feature-icon">🚚</span>
            <h4>Free Delivery</h4>
            <p>On orders above ₹499</p>
          </div>
          <div class="feature">
            <span class="feature-icon">🔄</span>
            <h4>Easy Returns</h4>
            <p>30-day hassle-free returns</p>
          </div>
          <div class="feature">
            <span class="feature-icon">🔐</span>
            <h4>Secure Payments</h4>
            <p>100% safe & encrypted</p>
          </div>
          <div class="feature">
            <span class="feature-icon">🎁</span>
            <h4>Best Prices</h4>
            <p>Price match guarantee</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-grid {
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: 32px;
      margin-bottom: 48px;
    }

    /* Banner */
    .home-banner {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      border-radius: var(--radius-xl);
      padding: 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      overflow: hidden;
      position: relative;
      min-height: 380px;
    }

    .banner-content { position: relative; z-index: 2; max-width: 400px; }
    .banner-eyebrow { color: var(--accent); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 12px; }
    .banner-title { font-size: 42px; color: white; margin-bottom: 16px; line-height: 1.1; }
    .accent-name { color: var(--accent); }
    .banner-subtitle { color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.7; margin-bottom: 32px; }

    .banner-stats { display: flex; gap: 20px; align-items: center; }
    .stat { display: flex; flex-direction: column; }
    .stat-number { font-size: 22px; font-weight: 700; color: white; }
    .stat-label { font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.06em; }
    .stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.15); }

    /* Floating decoration */
    .banner-decoration {
      position: absolute;
      right: -20px;
      top: 50%;
      transform: translateY(-50%);
    }

    .circle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.08;
      background: white;
    }
    .c1 { width: 200px; height: 200px; right: 20px; top: -60px; }
    .c2 { width: 130px; height: 130px; right: 120px; top: 40px; }
    .c3 { width: 80px; height: 80px; right: 60px; top: 80px; }

    .banner-emoji {
      font-size: 100px;
      position: relative;
      z-index: 1;
      filter: drop-shadow(0 8px 24px rgba(0,0,0,0.2));
    }

    /* CTA Cards */
    .home-ctas {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cta-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 20px;
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1.5px solid var(--border-light);
      text-decoration: none;
      transition: all var(--transition-slow);
      cursor: pointer;

      &:hover {
        border-color: var(--accent);
        box-shadow: var(--shadow);
        transform: translateX(4px);
      }
    }

    .cta-primary {
      border-color: var(--accent);
      background: linear-gradient(to right, rgba(233,69,96,0.03), white);
    }

    .cta-admin {
      border-color: rgba(139,92,246,0.3);
    }

    .cta-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }

    .cta-info {
      flex: 1;
      h3 { font-size: 15px; font-weight: 700; font-family: var(--font-body); margin-bottom: 2px; }
      p { font-size: 13px; color: var(--text-secondary); }
    }

    .cta-arrow { font-size: 18px; color: var(--text-muted); }
    .cta-badge {
      background: var(--accent);
      color: white;
      font-size: 12px;
      font-weight: 700;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Features */
    .features-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }

    .feature {
      background: white;
      border-radius: var(--radius-lg);
      padding: 24px 20px;
      text-align: center;
      border: 1px solid var(--border-light);
      box-shadow: var(--shadow-sm);

      .feature-icon { font-size: 32px; display: block; margin-bottom: 12px; }
      h4 { font-size: 15px; font-weight: 700; margin-bottom: 4px; font-family: var(--font-body); }
      p { font-size: 13px; color: var(--text-secondary); }
    }

    @media (max-width: 1024px) {
      .home-grid { grid-template-columns: 1fr; }
      .banner-emoji { display: none; }
    }

    @media (max-width: 768px) {
      .home-banner { padding: 32px; min-height: auto; }
      .banner-title { font-size: 32px; }
      .features-row { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class HomeComponent {
  auth = inject(AuthService);
  cartService = inject(CartService);
}
