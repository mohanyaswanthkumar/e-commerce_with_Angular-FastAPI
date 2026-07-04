import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AdminProductService } from '../../../core/services/admin-product.service';
import { NotificationService } from '../../../core/services/notification.service';

/**
 * Admin add/edit product form.
 * `/admin/products/new` -> add mode. `/admin/products/:id/edit` -> edit mode.
 * There's no GET /admin/products/{id} on the backend, so edit mode fetches
 * page 1 of the admin list and finds the match — fine for small catalogs;
 * swap for a dedicated GET later if the catalog grows.
 */
@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-product-form.component.html',
  styleUrl: './admin-product-form.component.scss',
})
export class AdminProductFormComponent implements OnInit {
  readonly isEditMode = signal(false);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  private productId: number | null = null;

  readonly form = this.fb.group({
    sku: ['', [Validators.required]],
    name: ['', [Validators.required]],
    description: [''],
    detailed_description: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    image_url: [''],
    category_id: [null as number | null],
    stock_quantity: [0, [Validators.required, Validators.min(0)]],
    is_active: [true],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminProductService: AdminProductService,
    private readonly notifications: NotificationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return;

    this.isEditMode.set(true);
    this.productId = Number(idParam);
    this.isLoading.set(true);

    this.adminProductService.list(1, 100).subscribe({
      next: (products) => {
        const existing = products.find((p) => p.id === this.productId);
        if (existing) {
          this.form.patchValue({
            sku: existing.sku,
            name: existing.name,
            description: existing.description ?? '',
            detailed_description: existing.detailed_description ?? '',
            price: existing.price,
            image_url: existing.image_url ?? '',
            category_id: existing.category?.id ?? null,
            stock_quantity: existing.stock_quantity,
            is_active: existing.is_active,
          });
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
    const payload = this.form.getRawValue() as any;

    const request$ = this.isEditMode() && this.productId
      ? this.adminProductService.update(this.productId, payload)
      : this.adminProductService.create(payload);

    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.notifications.showSuccess(this.isEditMode() ? 'Product updated.' : 'Product created.');
        this.router.navigate(['/admin/products']);
      },
      error: () => this.isSaving.set(false),
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/products']);
  }
}