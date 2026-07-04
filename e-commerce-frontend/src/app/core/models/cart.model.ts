/** Mirrors app/schemas/cart.py */

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image_url: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  is_in_stock: boolean;
}

export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  updated_at: string;
}

/** "Added to cart" popup payload — image + price, shown from PLP/PDP */
export interface AddedToCartPopup {
  product_id: number;
  product_name: string;
  product_image_url: string | null;
  price: number;
  quantity_in_cart: number;
}
