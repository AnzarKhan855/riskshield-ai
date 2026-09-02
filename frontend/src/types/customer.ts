import { Transaction } from "./transaction";

export interface Customer {
  id: string;
  customer_id: string;
  merchant_id: string;
  full_name: string;
  email: string;
  phone?: string;
  customer_since: string;
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  chargebacks: number;
  refunds: number;
  lifetime_value: number;
  average_transaction_value: number;
  highest_transaction_value: number;
  last_transaction_date?: string;
  preferred_payment_method?: string;
  country: string;
  state?: string;
  city?: string;
  risk_flags: string[];
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedCustomers {
  items: Customer[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CustomerFilterParams {
  search?: string;
  merchant_id?: string;
  min_ltv?: number;
  max_ltv?: number;
  country?: string;
  page?: number;
  size?: number;
  sort_by?: string;
  sort_dir?: string;
}
