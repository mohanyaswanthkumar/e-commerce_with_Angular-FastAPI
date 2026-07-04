/** Mirrors app/schemas/product.py */

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface ProductCard {
  id: number;
  sku: string;
  name: string;
  price: number;
  image_url: string | null;
  is_in_stock: boolean;
  is_wishlisted: boolean;
  /** UI-only: quantity selected in the PLP quantity box before Add to Cart */
  selectedQuantity?: number;
}

export interface ProductDetail {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  detailed_description: string | null;
  price: number;
  image_url: string | null;
  is_in_stock: boolean;
  stock_quantity: number;
  category: Category | null;
  is_wishlisted: boolean;
}

export interface ProductListResponse {
  items: ProductCard[];
  total: number;
  page: number;
  page_size: number;
}

export interface ProductCreate {
  sku: string;
  name: string;
  description?: string;
  detailed_description?: string;
  price: number;
  image_url?: string;
  category_id?: number;
  stock_quantity: number;
  is_active: boolean;
}

export type ProductUpdate = Partial<ProductCreate>;

export interface ProductAdmin extends ProductDetail {
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
