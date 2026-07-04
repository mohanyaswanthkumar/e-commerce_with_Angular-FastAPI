/** Mirrors app/schemas/payment.py */

export interface CreditCardCreate {
  cardholder_name: string;
  card_number: string;
  cvv: string;
  expiry_month: string;
  expiry_year: string;
}

export interface CreditCardUpdate {
  cardholder_name?: string;
  expiry_month?: string;
  expiry_year?: string;
}

export interface CreditCard {
  id: number;
  cardholder_name: string;
  card_number_masked: string;
  expiry_month: string;
  expiry_year: string;
  card_brand: string | null;
  status: 'active' | 'expired';
  created_at: string;
}

export type PaymentType = 'invoice_me' | 'credit_card';

export interface PaymentPreferenceUpdate {
  preference_type: PaymentType;
  default_credit_card_id?: number | null;
}

export interface PaymentPreference {
  preference_type: PaymentType;
  default_credit_card_id: number | null;
}
