import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface OrderSummaryLine {
  product_name: string;
  quantity: number;
  line_total: number;
}

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss',
})
export class OrderSummaryComponent {
  @Input() items: OrderSummaryLine[] = [];
  @Input() subtotal = 0;
  @Input() taxAmount = 0;
  @Input() shippingAmount = 0;
  @Input() totalAmount = 0;

  @Input() continueLabel = 'Continue';
  @Input() continueDisabled = false;
  @Input() isSubmitting = false;
  @Input() showBack = true;
  @Input() backLabel = 'Back';

  @Output() continueClicked = new EventEmitter<void>();
  @Output() backClicked = new EventEmitter<void>();
}