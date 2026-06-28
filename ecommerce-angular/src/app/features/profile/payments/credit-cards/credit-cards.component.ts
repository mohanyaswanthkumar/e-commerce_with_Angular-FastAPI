import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../../../core/services/profile.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CreditCard } from '../../../../shared/models';

@Component({
  selector: 'app-credit-cards',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-content">
      <div class="container" style="max-width:800px">
        <div class="page-header">
          <h1 class="section-title" style="margin-bottom:0">Credit Cards</h1>
          <button class="btn btn-primary" (click)="openForm()">+ Add New Card</button>
        </div>

        @if (loading()) {
          <div class="loading-overlay"><div class="spinner"></div></div>
        } @else if (cards().length === 0 && !showForm()) {
          <div class="empty-state">
            <div class="empty-icon">💳</div>
            <h3>No cards saved</h3>
            <p>Add a credit card to speed up checkout</p>
            <button class="btn btn-primary" (click)="openForm()">Add Card</button>
          </div>
        } @else {
          <div class="cards-grid">
            @for (card of cards(); track card.id) {
              <div class="credit-card-tile" [class.expired]="card.status === 'expired'">
                <div class="card-top">
                  <span class="card-brand">{{ card.card_brand || '💳' }}</span>
                  <span class="badge" [class]="card.status === 'active' ? 'badge-success' : 'badge-danger'">
                    {{ card.status | titlecase }}
                  </span>
                </div>
                <div class="card-number">•••• •••• •••• {{ card.last_four }}</div>
                <div class="card-bottom">
                  <div>
                    <p class="card-meta-label">Card Holder</p>
                    <p class="card-meta-value">{{ card.cardholder_name }}</p>
                  </div>
                  <div>
                    <p class="card-meta-label">Expires</p>
                    <p class="card-meta-value">{{ card.expiry_month }}/{{ card.expiry_year }}</p>
                  </div>
                </div>
                <div class="card-actions">
                  <button class="btn btn-ghost btn-sm" (click)="editCard(card)">Edit</button>
                  <button class="btn btn-danger btn-sm" (click)="deleteCard(card.id)"
                          [disabled]="deleting[card.id]">
                    @if (deleting[card.id]) { <span class="spinner spinner-sm"></span> } @else { Delete }
                  </button>
                </div>
              </div>
            }
          </div>
        }

        <!-- Form Modal -->
        @if (showForm()) {
          <div class="modal-backdrop" (click)="closeForm()">
            <div class="modal-box" (click)="$event.stopPropagation()">
              <h3 style="margin-bottom:20px;font-family:var(--font-body)">
                {{ editingId() ? 'Edit Card' : 'Add New Card' }}
              </h3>

              <form [formGroup]="form" (ngSubmit)="saveCard()">
                <div class="form-group">
                  <label class="form-label">Cardholder Name</label>
                  <input formControlName="cardholder_name" type="text" class="form-control" placeholder="John Doe">
                </div>

                @if (!editingId()) {
                  <div class="form-group">
                    <label class="form-label">Card Number</label>
                    <input formControlName="card_number" type="text" class="form-control"
                           placeholder="1234 5678 9012 3456" maxlength="19"
                           (input)="formatCardNum($event)">
                  </div>

                  <div class="form-group">
                    <label class="form-label">CVV</label>
                    <input formControlName="cvv" type="password" class="form-control"
                           placeholder="•••" maxlength="4">
                  </div>
                }

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Expiry Month</label>
                    <select formControlName="expiry_month" class="form-control">
                      @for (m of months; track m) {
                        <option [value]="m">{{ m | number:'2.0-0' }}</option>
                      }
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Expiry Year</label>
                    <select formControlName="expiry_year" class="form-control">
                      @for (y of years; track y) {
                        <option [value]="y">{{ y }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-ghost" (click)="closeForm()">Cancel</button>
                  <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
                    @if (saving()) { <span class="spinner spinner-sm"></span> }
                    {{ editingId() ? 'Update' : 'Save' }} Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:28px; }
    .cards-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin-top:24px; }

    .credit-card-tile {
      background: linear-gradient(135deg,var(--primary) 0%,var(--primary-light) 100%);
      border-radius:var(--radius-lg);
      padding:24px;
      color:white;
      position:relative;
      min-height:180px;
      display:flex;flex-direction:column;justify-content:space-between;
      box-shadow:var(--shadow-lg);

      &.expired { opacity:0.65;filter:grayscale(0.4); }
    }

    .card-top { display:flex;justify-content:space-between;align-items:center;margin-bottom:20px; }
    .card-brand { font-size:22px;font-weight:700;letter-spacing:0.05em; }
    .card-number { font-size:20px;font-weight:600;letter-spacing:0.2em;margin-bottom:16px;font-family:monospace; }
    .card-bottom { display:flex;gap:24px; }
    .card-meta-label { font-size:10px;text-transform:uppercase;letter-spacing:0.1em;opacity:0.6;margin-bottom:2px; }
    .card-meta-value { font-size:14px;font-weight:600; }
    .card-actions { display:flex;gap:8px;margin-top:16px; .btn{background:rgba(255,255,255,0.15);color:white;border-color:rgba(255,255,255,0.3);&:hover{background:rgba(255,255,255,0.25)}} .btn-danger{background:rgba(239,68,68,0.3);border-color:rgba(239,68,68,0.4);&:hover{background:rgba(239,68,68,0.5)}} }
    .form-row { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
    .form-actions { display:flex;gap:12px;justify-content:flex-end; }
  `]
})
export class CreditCardsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private toast = inject(ToastService);

  cards = signal<CreditCard[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  editingId = signal<number | null>(null);
  deleting: Record<number, boolean> = {};

  months = Array.from({ length: 12 }, (_, i) => i + 1);
  years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

  form = this.fb.group({
    cardholder_name: ['', Validators.required],
    card_number: ['', Validators.required],
    cvv: ['', Validators.required],
    expiry_month: [1, Validators.required],
    expiry_year: [this.years[0], Validators.required]
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.profileService.getCreditCards().subscribe({
      next: data => { this.cards.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  openForm(): void {
    this.editingId.set(null);
    this.form.reset({ expiry_month: 1, expiry_year: this.years[0] });
    this.form.get('card_number')?.setValidators(Validators.required);
    this.form.get('cvv')?.setValidators(Validators.required);
    this.form.updateValueAndValidity();
    this.showForm.set(true);
  }

  editCard(card: CreditCard): void {
    this.editingId.set(card.id);
    this.form.get('card_number')?.clearValidators();
    this.form.get('cvv')?.clearValidators();
    this.form.updateValueAndValidity();
    this.form.patchValue({
      cardholder_name: card.cardholder_name,
      expiry_month: card.expiry_month,
      expiry_year: card.expiry_year
    } as any);
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); this.editingId.set(null); }

  formatCardNum(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
    this.form.get('card_number')?.setValue(input.value.replace(/\s/g, ''));
  }

  saveCard(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    const obs = this.editingId()
      ? this.profileService.updateCreditCard(this.editingId()!, { cardholder_name: v.cardholder_name!, expiry_month: Number(v.expiry_month), expiry_year: Number(v.expiry_year) })
      : this.profileService.addCreditCard({ cardholder_name: v.cardholder_name!, card_number: v.card_number!, cvv: v.cvv!, expiry_month: Number(v.expiry_month), expiry_year: Number(v.expiry_year) });

    obs.subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.load(); this.toast.success(this.editingId() ? 'Card updated!' : 'Card added!'); },
      error: (e) => { this.saving.set(false); this.toast.error(e.error?.detail || 'Failed to save card'); }
    });
  }

  deleteCard(id: number): void {
    if (!confirm('Delete this card?')) return;
    this.deleting[id] = true;
    this.profileService.deleteCreditCard(id).subscribe({
      next: () => { this.deleting[id] = false; this.load(); this.toast.success('Card deleted'); },
      error: (e) => { this.deleting[id] = false; this.toast.error(e.error?.detail || 'Delete failed'); }
    });
  }
}
