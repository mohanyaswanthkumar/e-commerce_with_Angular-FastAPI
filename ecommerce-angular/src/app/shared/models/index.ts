// ─── Auth ───────────────────────────────────────────────
export interface LoginRequest {
  identifier: string;  // email or mobile
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  mobile: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface TokenPayload {
  sub: string;
  role: string;
  exp: number;
}

// ─── User / Profile ─────────────────────────────────────
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  role: string;
  created_at: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

// ─── Address ─────────────────────────────────────────────
export interface Address {
  id: number;
  label: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface AddressRequest {
  label: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

// ─── Credit Card ─────────────────────────────────────────
export interface CreditCard {
  id: number;
  cardholder_name: string;
  last_four: string;
  expiry_month: number;
  expiry_year: number;
  card_brand: string;
  is_default: boolean;
  status: 'active' | 'expired';
}

export interface CreditCardRequest {
  cardholder_name: string;
  card_number: string;
  cvv: string;
  expiry_month: number;
  expiry_year: number;
}

// ─── Payment Preference ─────────────────────────────────
export interface PaymentPreference {
  payment_type: 'invoice' | 'credit_card';
  credit_card_id?: number | null;
}

// ─── Product ─────────────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  description: string;
  short_description?: string;
  price: number;
  original_price?: number;
  sku: string;
  category: string;
  brand?: string;
  images: string[];
  thumbnail: string;
  is_in_stock: boolean;
  stock_quantity: number;
  rating?: number;
  review_count?: number;
  is_wishlisted?: boolean;
  sap_material_number?: string;
  tags?: string[];
  specifications?: Record<string, string>;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface ProductFilterParams {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  in_stock_only?: boolean;
  sort_by?: string;
  page?: number;
  page_size?: number;
}

// ─── Cart ────────────────────────────────────────────────
export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_thumbnail: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  is_in_stock: boolean;
}

export interface Cart {
  items: CartItem[];
  total_items: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// ─── Checkout ────────────────────────────────────────────
export interface ShippingBillingInfo {
  addresses: Address[];
  selected_address_id?: number;
  payment_preference: PaymentPreference;
  credit_cards: CreditCard[];
  cart_items: CartItem[];
  order_summary: OrderSummary;
}

export interface CheckoutReviewRequest {
  address_id: number;
  payment_type: 'invoice' | 'credit_card';
  credit_card_id?: number | null;
}

export interface CheckoutReviewResponse {
  address: Address;
  payment_type: string;
  credit_card?: CreditCard;
  cart_items: CartItem[];
  order_summary: OrderSummary;
}

export interface PlaceOrderRequest {
  address_id: number;
  payment_type: 'invoice' | 'credit_card';
  credit_card_id?: number | null;
  notes?: string;
}

export interface OrderSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  total_items: number;
}

// ─── Order ───────────────────────────────────────────────
export type OrderStatus = 'pending' | 'in_progress' | 'on_hold' | 'completed' | 'refunded' | 'cancelled';
export type SapSyncStatus = 'pending' | 'synced' | 'failed';

export interface Order {
  id: number;
  order_number: string;
  sap_sales_order_number?: string;
  sap_sync_status: SapSyncStatus;
  status: OrderStatus;
  payment_type: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  items: OrderItem[];
  address: Address;
  created_at: string;
  updated_at: string;
  is_favourite: boolean;
  notes?: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_thumbnail: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderListResponse {
  items: Order[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface TrackingOrder {
  order_number: string;
  status: OrderStatus;
  sap_sales_order_number?: string;
  created_at: string;
  estimated_delivery?: string;
  tracking_steps: TrackingStep[];
}

export interface TrackingStep {
  label: string;
  status: 'completed' | 'active' | 'pending';
  timestamp?: string;
}

// ─── Admin ───────────────────────────────────────────────
export interface AdminProductRequest {
  name: string;
  description: string;
  short_description?: string;
  price: number;
  original_price?: number;
  sku: string;
  category: string;
  brand?: string;
  images?: string[];
  thumbnail?: string;
  is_in_stock?: boolean;
  stock_quantity?: number;
  tags?: string[];
  specifications?: Record<string, string>;
}

export interface AdminUserResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminUserUpdateRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile?: string;
  role?: string;
  is_active?: boolean;
}

export interface DashboardStats {
  total_users: number;
  total_orders: number;
  total_products: number;
  total_revenue: number;
  pending_orders: number;
  low_stock_products: number;
}

// ─── API Response Wrappers ──────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
