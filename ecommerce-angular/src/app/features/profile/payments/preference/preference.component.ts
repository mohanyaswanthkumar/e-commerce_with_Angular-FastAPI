import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../../core/services/profile.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CreditCard, PaymentPreference } from '../../../../shared/models';

@Component({
  selector: 'app-preference',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-content">
      <div class="container" style="max-width:560px">
        <h1 class="section-title">Default Payment Preference</h1>

        @if (loading()) {
          <div class="loading-overlay"><div class="spinner"></div></div>
        } @else {
          <div class="card">
            <p style="color:var(--text-secondary);font-size:14px;margin-bottom:24px">
              This preference will be pre-selected during checkout.
            </p>

            @if (successMsg()) { <div class="alert alert-success">{{ successMsg() }}</div> }
            @if (errorMsg()) { <div class="alert alert-danger">{{ errorMsg() }}</div> }

            <div class="pref-options">
              <label class="pref-option" [class.selected]="paymentType === 'invoice'">
                <input type="radio" [(ngModel)]="paymentType" value="invoice" name="pref">
                <div class="pref-content">
                  <span class="pref-icon">🧾</span>
                  <div>
                    <strong>Invoice Me</strong>
                    <p>Receive an invoice and pay after delivery</p>
                  </div>
                </div>
              </label>

              <label class="pref-option" [class.selected]="paymentType === 'credit_card'">
                <input type="radio" [(ngModel)]="paymentType" value="credit_card" name="pref">
                <div class="pref-content">
                  <span class="pref-icon">💳</span>
                  <div>
                    <strong>Credit Card</strong>
                    <p>Pay with a saved credit card</p>
                  </div>
                </div>
              </label>
            </div>

            @if (paymentType === 'credit_card') {
              <div style="margin-top:16px">
                <label class="form-label">Select Active Card</label>
                @if (activeCards().length === 0) {
                  <div class="alert alert-info">
                    No active credit cards found.
                    <a href="/profile/payments/credit-cards" style="font-weight:700;color:inherit">Add one here</a>.
                  </div>
                } @else {
                  <select class="form-control" [(ngModel)]="selectedCardId" name="card">
                    <option [value]="0">-- Choose a card --</option>
                    @for (card of activeCards(); track card.id) {
                      <option [value]="card.id">
                        {{ card.card_brand }} •••• {{ card.last_four }} – {{ card.cardholder_name }}
                      </option>
                    }
                  </select>
                }
              </div>
            }

            <div class="form-actions" style="margin-top:24px">
              <button class="btn btn-ghost" (click)="cancel()">Cancel</button>
              <button class="btn btn-primary" (click)="save()" [disabled]="saving() || !isValid()">
                @if (saving()) { <span class="spinner spinner-sm"></span> }
                Save Preference
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .pref-options { display:flex;flex-direction:column;gap:12px; }
    .pref-option { display:flex;align-items:center;gap:0;padding:16px;border:1.5px solid var(--border);border-radius:var(--radius);cursor:pointer;transition:all var(--transition); input{display:none} &.selected{border-color:var(--accent);background:rgba(233,69,96,0.04)} }
    .pref-content { display:flex;align-items:center;gap:14px;width:100%; }
    .pref-icon { font-size:26px; }
    .pref-content strong { display:block;margin-bottom:2px; }
    .pref-content p { font-size:13px;color:var(--text-secondary);margin:0; }
    .form-actions { display:flex;gap:12px;justify-content:flex-end; }
  `]
})
export class PreferenceComponent implements OnInit {
  private profileService = inject(ProfileService);
  private toast = inject(ToastService);

  cards = signal<CreditCard[]>([]);
  loading = signal(true);
  saving = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  paymentType: 'invoice' | 'credit_card' = 'invoice';
  selectedCardId = 0;
  originalPref: PaymentPreference | null = null;

  activeCards = () => this.cards().filter(c => c.status === 'active');

  ngOnInit(): void {
    Promise.all([
      this.profileService.getPaymentPreference().toPromise(),
      this.profileService.getCreditCards().toPromise()
    ]).then(([pref, cards]) => {
      if (pref) {
        this.originalPref = pref;
        this.paymentType = pref.payment_type;
        this.selectedCardId = pref.credit_card_id ?? 0;
      }
      if (cards) this.cards.set(cards);
      this.loading.set(false);
    }).catch(() => { this.loading.set(false); this.toast.error('Failed to load preferences'); });
  }

  isValid(): boolean {
    return this.paymentType === 'invoice' || (this.paymentType === 'credit_card' && this.selectedCardId > 0);
  }

  cancel(): void {
    if (this.originalPref) {
      this.paymentType = this.originalPref.payment_type;
      this.selectedCardId = this.originalPref.credit_card_id ?? 0;
    }
  }

  save(): void {
    this.saving.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    const req: PaymentPreference = {
      payment_type: this.paymentType,
      credit_card_id: this.paymentType === 'credit_card' ? this.selectedCardId : null
    };

    this.profileService.updatePaymentPreference(req).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.originalPref = res;
        this.successMsg.set('Payment preference saved!');
        setTimeout(() => this.successMsg.set(''), 3500);
      },
      error: (e) => { this.saving.set(false); this.errorMsg.set(e.error?.detail || 'Failed to save'); }
    });
  }
}
