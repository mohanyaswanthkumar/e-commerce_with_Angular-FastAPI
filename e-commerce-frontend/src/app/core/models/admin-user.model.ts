/** Mirrors app/admin/schemas.py exactly. */

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  role: 'customer' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface AdminUserUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile_number?: string;
  role?: 'customer' | 'admin';
  is_active?: boolean;
}

export interface AdminUserListResponse {
  items: AdminUser[];
  total: number;
  page: number;
  page_size: number;
}