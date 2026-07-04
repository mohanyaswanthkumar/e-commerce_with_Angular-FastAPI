/** Mirrors app/schemas/address.py */

export interface AddressBase {
  label?: string | null;
  full_name: string;
  phone_number: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export type AddressCreate = AddressBase;
export type AddressUpdate = AddressBase;

export interface Address extends AddressBase {
  id: number;
  user_id: number;
  created_at: string;
}
