import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-cart-shell',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="page-content">
      <div class="container">
        <h1 class="section-title">Checkout</h1>

        <!-- Stepper -->
        <div class="stepper">
          <div class="step" [class.active]="currentStep() >= 1" [class.completed]="currentStep() > 1">
            <div class="step-num">{{ currentStep() > 1 ? '✓' : '1' }}</div>
            <span class="step-label">Shipping & Billing</span>
          </div>
          <div class="step-connector" [class.completed]="currentStep() > 1"></div>
          <div class="step" [class.active]="currentStep() >= 2" [class.completed]="currentStep() > 2">
            <div class="step-num">{{ currentStep() > 2 ? '✓' : '2' }}</div>
            <span class="step-label">Order Review</span>
          </div>
          <div class="step-connector" [class.completed]="currentStep() > 2"></div>
          <div class="step" [class.active]="currentStep() >= 3">
            <div class="step-num">3</div>
            <span class="step-label">Confirmation</span>
          </div>
        </div>

        <router-outlet />
      </div>
    </div>
  `,
  styles: [``]
})
export class CartShellComponent {
  private router = inject(Router);
  currentStep = signal(1);

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      if (e.url.includes('/cart/shipping')) this.currentStep.set(1);
      else if (e.url.includes('/cart/review')) this.currentStep.set(2);
      else if (e.url.includes('/cart/confirmation')) this.currentStep.set(3);
    });
    // set initial
    const url = this.router.url;
    if (url.includes('/cart/review')) this.currentStep.set(2);
    else if (url.includes('/cart/confirmation')) this.currentStep.set(3);
    else this.currentStep.set(1);
  }
}
