import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}" (click)="toastService.remove(toast.id)">
          <span class="toast-icon">
            @switch (toast.type) {
              @case ('success') { ✅ }
              @case ('error') { ❌ }
              @case ('warning') { ⚠️ }
              @default { ℹ️ }
            }
          </span>
          <span class="toast-msg">{{ toast.message }}</span>
          <button class="toast-close">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 88px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      min-width: 280px;
      max-width: 400px;
      animation: slideDown 0.2s ease;
      cursor: pointer;
      border: 1px solid transparent;
      font-size: 14px;
      font-weight: 500;
    }

    .toast-success { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
    .toast-error { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
    .toast-warning { background: #fffbeb; color: #b45309; border-color: #fde68a; }
    .toast-info { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }

    .toast-msg { flex: 1; }
    .toast-close { background: none; border: none; font-size: 18px; line-height: 1; cursor: pointer; opacity: 0.6; color: inherit; }

    @media (max-width: 480px) {
      .toast-container { right: 12px; left: 12px; }
      .toast { min-width: unset; }
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
