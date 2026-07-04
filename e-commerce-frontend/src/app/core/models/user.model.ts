/** Mirrors app/schemas/user.py */

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  mobile_number: string;
}

export interface LoginRequest {
  /** email OR mobile number, per spec */
  identifier: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  reset_token: string;
  new_password: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  role: 'customer' | 'admin' | string;
  created_at: string;
}

export interface AccountDetailsUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile_number?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}
