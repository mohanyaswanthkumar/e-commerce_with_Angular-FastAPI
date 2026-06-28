import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, AdminProductRequest } from '../../../shared/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss']
})
export class AdminProductsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private toast = inject(ToastService);

  products = signal<Product[]>([]);
  categories = signal<string[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  editingId = signal<number | null>(null);
  deleting: Record<number, boolean> = {};

  searchTerm = '';
  searchTimeout?: ReturnType<typeof setTimeout>;
  page = signal(1);
  total = signal(0);
  pageSize = 12;
  totalPages = () => Math.ceil(this.total() / this.pageSize);

  form = this.fb.group({
    name: ['', Validators.required],
    sku: ['', Validators.required],
    category: ['', Validators.required],
    brand: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    original_price: [null as number | null],
    stock_quantity: [0, [Validators.required, Validators.min(0)]],
    is_in_stock: [true],
    short_description: [''],
    description: ['', Validators.required],
    thumbnail: [''],
    tags: ['']
  });

  ngOnInit(): void {
    this.loadProducts();
    this.productService.getCategories().subscribe(c => this.categories.set(c));
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.adminGetProducts({
      search: this.searchTerm || undefined,
      page: this.page(),
      page_size: this.pageSize
    }).subscribe({
      next: res => { this.products.set(res.items); this.total.set(res.total); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load products'); }
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => { this.page.set(1); this.loadProducts(); }, 400);
  }

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ is_in_stock: true, price: 0, stock_quantity: 0 });
    this.showForm.set(true);
  }

  openEdit(product: Product): void {
    this.editingId.set(product.id);
    this.form.patchValue({
      ...product,
      tags: product.tags?.join(', ') ?? ''
    } as any);
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); this.editingId.set(null); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const v = this.form.value;
    const payload: AdminProductRequest = {
      name: v.name!,
      sku: v.sku!,
      category: v.category!,
      brand: v.brand ?? undefined,
      price: Number(v.price),
      original_price: v.original_price ? Number(v.original_price) : undefined,
      stock_quantity: Number(v.stock_quantity),
      is_in_stock: !!v.is_in_stock,
      short_description: v.short_description ?? undefined,
      description: v.description!,
      thumbnail: v.thumbnail ?? undefined,
      tags: v.tags ? (v.tags as string).split(',').map((t: string) => t.trim()).filter(Boolean) : []
    };

    const obs = this.editingId()
      ? this.productService.adminUpdateProduct(this.editingId()!, payload)
      : this.productService.adminCreateProduct(payload);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.loadProducts();
        this.toast.success(this.editingId() ? 'Product updated!' : 'Product created!');
      },
      error: (e) => { this.saving.set(false); this.toast.error(e.error?.detail || 'Failed to save product'); }
    });
  }

  delete(id: number): void {
    if (!confirm('Permanently delete this product?')) return;
    this.deleting[id] = true;
    this.productService.adminDeleteProduct(id).subscribe({
      next: () => { this.deleting[id] = false; this.loadProducts(); this.toast.success('Product deleted'); },
      error: (e) => { this.deleting[id] = false; this.toast.error(e.error?.detail || 'Delete failed'); }
    });
  }

  goToPage(p: number): void { this.page.set(p); this.loadProducts(); }

  pageNums(): number[] {
    const arr: number[] = [];
    for (let i = Math.max(1, this.page() - 2); i <= Math.min(this.totalPages(), this.page() + 2); i++) arr.push(i);
    return arr;
  }

  onImgError(e: Event): void { (e.target as HTMLImageElement).src = '/assets/images/placeholder.png'; }
}
