import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { PaymentService } from '../../../core/services/payment.service';
import { CreditCard, PaymentType } from '../../../core/models/payment.model';
import { NotificationService } from '../../../core/services/notification.service';

/**
 * Default payment preference page: two radio buttons (Invoice me / Credit
 * card -> dropdown of active cards), with Save/Cancel CTAs.
 */
@Component({
  selector: 'app-payment-preference',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-preference.component.html',
  styleUrl: './payment-preference.component.scss',
})
export class PaymentPreferenceComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly activeCards = signal<CreditCard[]>([]);

  readonly form = this.fb.group({
    preference_type: ['invoice_me' as PaymentType, [Validators.required]],
    default_credit_card_id: [null as number | null],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly paymentService: PaymentService,
    private readonly notifications: NotificationService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.paymentService.listCreditCards().subscribe({
      next: (cards) => this.activeCards.set(cards.filter((c) => c.status === 'active')),
    });

    this.paymentService.getPreference().subscribe({
      next: (pref) => {
        if (pref) {
          this.form.patchValue({
            preference_type: pref.preference_type,
            default_credit_card_id: pref.default_credit_card_id,
          });
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  get isCreditCardSelected(): boolean {
    return this.form.value.preference_type === 'credit_card';
  }

  save(): void {
    if (this.isCreditCardSelected && !this.form.value.default_credit_card_id) {
      this.notifications.showError('Select a credit card to use as your default.');
      return;
    }

    this.isSaving.set(true);
    this.paymentService
      .setPreference({
        preference_type: this.form.value.preference_type!,
        default_credit_card_id: this.isCreditCardSelected ? this.form.value.default_credit_card_id : null,
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.notifications.showSuccess('Payment preference saved.');
        },
        error: () => this.isSaving.set(false),
      });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}