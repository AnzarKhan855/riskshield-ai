export type UserRole = "Admin" | "Merchant" | "Analyst";
export type UserStatus = "Active" | "Inactive" | "Suspended" | "Pending";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  email_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface APIResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    type?: string;
    detail?: string;
    [key: string]: any;
  };
  meta?: Record<string, any>;
}
