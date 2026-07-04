/** Mirrors app/schemas/order.py */
import { Address } from './address.model';
import { PaymentType } from './payment.model';

export interface CartSummaryLineForCheckout {
  product_id: number;
  product_name: string;
  product_image_url?: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface CartSummaryForCheckout {
  items: CartSummaryLineForCheckout[];
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
}

/** GET /checkout/shipping-billing — cart page, Step 1 */
export interface CheckoutShippingBillingOut {
  available_addresses: Address[];
  selected_address_id: number | null;
  payment_type: PaymentType | null;
  selected_credit_card_id: number | null;
  cart: CartSummaryForCheckout;
}

export interface PlaceOrderRequest {
  address_id: number;
  payment_type: PaymentType;
  credit_card_id?: number | null;
}

/** POST /checkout/review — cart page, Step 2 */
export interface OrderReviewOut {
  address: Address;
  payment_type: string;
  items: CartSummaryLineForCheckout[];
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
}

export interface OrderItem {
  product_id: number;
  product_name_snapshot: string;
  sku_snapshot: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export type SapSyncStatus = 'pending' | 'synced' | 'failed';

/**
 * cart page, Step 3 — Order Confirmation.
 * Displays BOTH the Local Order ID (id / order_number) and the SAP Sales
 * Order Number (sap_sales_order_number) per the SAP RAP integration requirement.
 * sap_sales_order_number may briefly be null while sap_sync_status === 'pending';
 * the frontend can poll GET /orders/{id}/confirmation until it's populated.
 */
export interface OrderConfirmation {
  id: number;
  order_number: string;
  status: string;
  sap_sales_order_number: string | null;
  sap_sync_status: SapSyncStatus;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  created_at: string;
}

export type OrderStatus = 'in_progress' | 'on_hold' | 'completed' | 'refunded';

export interface OrderTile {
  id: number;
  order_number: string;
  status: string;
  sap_sales_order_number: string | null;
  total_amount: number;
  created_at: string;
  is_favourite: boolean;
  item_count: number;
}

export interface OrderHistoryResponse {
  items: OrderTile[];
  total: number;
  page: number;
  page_size: number;
}

export interface OrderDetail extends OrderConfirmation {
  tracking_status: string | null;
  tracking_number: string | null;
}

export interface TrackOrderTile {
  id: number;
  order_number: string;
  tracking_status: string | null;
  tracking_number: string | null;
  sap_sales_order_number: string | null;
  created_at: string;
}

export interface ReorderResponse {
  message: string;
  cart_item_count: number;
}
