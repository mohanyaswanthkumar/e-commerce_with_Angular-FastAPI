import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';
import { Address, AddressRequest } from '../../../shared/models';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-content">
      <div class="container" style="max-width:800px">
        <div class="page-header">
          <h1 class="section-title" style="margin-bottom:0">My Addresses</h1>
          <button class="btn btn-primary" (click)="openForm()">+ Add New Address</button>
        </div>

        @if (loading()) {
          <div class="loading-overlay"><div class="spinner"></div></div>
        } @else if (addresses().length === 0 && !showForm()) {
          <div class="empty-state">
            <div class="empty-icon">📍</div>
            <h3>No addresses yet</h3>
            <p>Add an address to speed up checkout</p>
            <button class="btn btn-primary" (click)="openForm()">Add Address</button>
          </div>
        } @else {
          <div class="addresses-grid">
            @for (addr of addresses(); track addr.id) {
              <div class="address-card card" [class.default-card]="addr.is_default">
                @if (addr.is_default) {
                  <div class="default-label">Default</div>
                }
                <div class="addr-header">
                  <strong class="addr-label-text">{{ addr.label }}</strong>
                  <div class="addr-actions">
                    <button class="btn btn-ghost btn-sm" (click)="editAddress(addr)">Edit</button>
                    <button class="btn btn-danger btn-sm" (click)="deleteAddress(addr.id)"
                            [disabled]="deleting[addr.id]">
                      @if (deleting[addr.id]) { <span class="spinner spinner-sm"></span> } @else { Delete }
                    </button>
                  </div>
                </div>
                <p class="addr-full">
                  {{ addr.street }}<br>
                  {{ addr.city }}, {{ addr.state }} – {{ addr.postal_code }}<br>
                  {{ addr.country }}
                </p>
              </div>
            }
          </div>
        }

        <!-- Add/Edit Form Modal -->
        @if (showForm()) {
          <div class="modal-backdrop" (click)="closeForm()">
            <div class="modal-box" (click)="$event.stopPropagation()">
              <h3 style="margin-bottom:20px;font-family:var(--font-body)">
                {{ editingId() ? 'Edit Address' : 'Add New Address' }}
              </h3>

              <form [formGroup]="form" (ngSubmit)="saveAddress()">
                <div class="form-group">
                  <label class="form-label">Label</label>
                  <input formControlName="label" type="text" class="form-control" placeholder="Home, Office, etc.">
                </div>

                <div class="form-group">
                  <label class="form-label">Street Address</label>
                  <input formControlName="street" type="text" class="form-control" placeholder="123 Main Street">
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">City</label>
                    <input formControlName="city" type="text" class="form-control" placeholder="Chennai">
                  </div>
                  <div class="form-group">
                    <label class="form-label">State</label>
                    <input formControlName="state" type="text" class="form-control" placeholder="Tamil Nadu">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Postal Code</label>
                    <input formControlName="postal_code" type="text" class="form-control" placeholder="600001">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Country</label>
                    <input formControlName="country" type="text" class="form-control" placeholder="India">
                  </div>
                </div>

                <label class="check-label">
                  <input type="checkbox" formControlName="is_default">
                  Set as default address
                </label>

                <div class="form-actions">
                  <button type="button" class="btn btn-ghost" (click)="closeForm()">Cancel</button>
                  <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
                    @if (saving()) { <span class="spinner spinner-sm"></span> }
                    {{ editingId() ? 'Update' : 'Save' }} Address
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
    .addresses-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;margin-top:24px; }
    .address-card { position:relative;padding:20px; }
    .default-card { border-color:var(--accent);border-width:2px; }
    .default-label { position:absolute;top:12px;right:12px;background:var(--accent);color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:50px;text-transform:uppercase; }
    .addr-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:10px; }
    .addr-label-text { font-size:16px;font-weight:700; }
    .addr-actions { display:flex;gap:8px; }
    .addr-full { font-size:14px;color:var(--text-secondary);line-height:1.8; }
    .form-row { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
    .check-label { display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer;margin-bottom:20px; input{accent-color:var(--accent)} }
    .form-actions { display:flex;gap:12px;justify-content:flex-end; }
    @media(max-width:600px){.form-row{grid-template-columns:1fr}}
  `]
})
export class AddressesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private toast = inject(ToastService);

  addresses = signal<Address[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  editingId = signal<number | null>(null);
  deleting: Record<number, boolean> = {};

  form = this.fb.group({
    label: ['', Validators.required],
    street: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postal_code: ['', Validators.required],
    country: ['India', Validators.required],
    is_default: [false]
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.profileService.getAddresses().subscribe({
      next: data => { this.addresses.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  openForm(): void { this.form.reset({ country: 'India', is_default: false }); this.editingId.set(null); this.showForm.set(true); }
  closeForm(): void { this.showForm.set(false); this.editingId.set(null); }

  editAddress(addr: Address): void {
    this.editingId.set(addr.id);
    this.form.patchValue(addr as any);
    this.showForm.set(true);
  }

  saveAddress(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const req = this.form.value as AddressRequest;
    const obs = this.editingId()
      ? this.profileService.updateAddress(this.editingId()!, req)
      : this.profileService.addAddress(req);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.load();
        this.toast.success(this.editingId() ? 'Address updated!' : 'Address added!');
      },
      error: (e) => { this.saving.set(false); this.toast.error(e.error?.detail || 'Failed to save address'); }
    });
  }

  deleteAddress(id: number): void {
    if (!confirm('Delete this address?')) return;
    this.deleting[id] = true;
    this.profileService.deleteAddress(id).subscribe({
      next: () => { this.deleting[id] = false; this.load(); this.toast.success('Address deleted'); },
      error: (e) => { this.deleting[id] = false; this.toast.error(e.error?.detail || 'Delete failed'); }
    });
  }
}
