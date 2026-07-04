import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PaymentService } from '../../../core/services/payment.service';
import { NotificationService } from '../../../core/services/notification.service';

/**
 * Add new card page: cardholder-name, card-number, cvv, expiry, with Save/Cancel CTA.
 * Also doubles as the edit form (`/payments/credit-cards/:id/edit`) — card
 * number/CVV are not editable once saved (mirrors CreditCardUpdate on the
 * backend, which only accepts cardholder_name/expiry_month/expiry_year).
 */
@Component({
  selector: 'app-credit-card-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './credit-card-form.component.html',
  styleUrl: './credit-card-form.component.scss',
})
export class CreditCardFormComponent implements OnInit {
  readonly isEditMode = signal(false);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  private cardId: number | null = null;

  readonly form = this.fb.group({
    cardholder_name: ['', [Validators.required]],
    card_number: ['', [Validators.required, Validators.pattern(/^\d{13,19}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    expiry_month: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]],
    expiry_year: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly paymentService: PaymentService,
    private readonly notifications: NotificationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return;

    this.isEditMode.set(true);
    this.cardId = Number(idParam);
    this.isLoading.set(true);

    // Backend has no GET /payments/credit-cards/{id}; reuse the list and find the match.
    this.paymentService.listCreditCards().subscribe({
      next: (cards) => {
        const existing = cards.find((c) => c.id === this.cardId);
        if (existing) {
          this.form.patchValue({
            cardholder_name: existing.cardholder_name,
            expiry_month: existing.expiry_month,
            expiry_year: existing.expiry_year,
          });
          // Card number and CVV can't be edited or re-displayed once saved.
          this.form.get('card_number')?.disable();
          this.form.get('cvv')?.disable();
          this.form.get('card_number')?.clearValidators();
          this.form.get('cvv')?.clearValidators();
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    if (this.isEditMode() && this.cardId) {
      this.paymentService
        .updateCreditCard(this.cardId, {
          cardholder_name: this.form.value.cardholder_name!,
          expiry_month: this.form.value.expiry_month!,
          expiry_year: this.form.value.expiry_year!,
        })
        .subscribe({
          next: () => this.onSaved('Card updated.'),
          error: () => this.isSaving.set(false),
        });
    } else {
      this.paymentService.addCreditCard(this.form.getRawValue() as any).subscribe({
        next: () => this.onSaved('Card added.'),
        error: () => this.isSaving.set(false),
      });
    }
  }

  private onSaved(message: string): void {
    this.isSaving.set(false);
    this.notifications.showSuccess(message);
    this.router.navigate(['/payments/credit-cards']);
  }

  cancel(): void {
    this.router.navigate(['/payments/credit-cards']);
  }
}