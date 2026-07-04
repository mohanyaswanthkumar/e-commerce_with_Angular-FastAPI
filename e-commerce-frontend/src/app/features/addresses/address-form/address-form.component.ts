import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AddressService } from '../../../core/services/address.service';
import { NotificationService } from '../../../core/services/notification.service';

/**
 * Add-new-address / edit-address form.
 * Route `/addresses/new` -> add mode. Route `/addresses/:id/edit` -> edit mode
 * (loads the existing address first). Same component, same form for both.
 */
@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.scss',
})
export class AddressFormComponent implements OnInit {
  readonly isEditMode = signal(false);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  private addressId: number | null = null;

  readonly form = this.fb.group({
    label: [''],
    full_name: ['', [Validators.required]],
    phone_number: ['', [Validators.required]],
    line1: ['', [Validators.required]],
    line2: [''],
    city: ['', [Validators.required]],
    state: ['', [Validators.required]],
    postal_code: ['', [Validators.required]],
    country: ['', [Validators.required]],
    is_default: [false],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly addressService: AddressService,
    private readonly notifications: NotificationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return;

    this.isEditMode.set(true);
    this.addressId = Number(idParam);
    this.isLoading.set(true);

    // Backend has no GET /addresses/{id}; reuse the list and find the match.
    this.addressService.list().subscribe({
      next: (addresses) => {
        const existing = addresses.find((a) => a.id === this.addressId);
        if (existing) this.form.patchValue(existing);
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
    const payload = this.form.getRawValue() as any;

    const request$ = this.isEditMode() && this.addressId
      ? this.addressService.update(this.addressId, payload)
      : this.addressService.create(payload);

    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.notifications.showSuccess(this.isEditMode() ? 'Address updated.' : 'Address added.');
        this.router.navigate(['/addresses']);
      },
      error: () => this.isSaving.set(false),
    });
  }

  cancel(): void {
    this.router.navigate(['/addresses']);
  }
}