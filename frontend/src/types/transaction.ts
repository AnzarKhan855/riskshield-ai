export type TransactionStatus =
  | "Pending"
  | "Processing"
  | "Success"
  | "Failed"
  | "Cancelled"
  | "Refunded"
  | "Chargeback";

export type PaymentMethod =
  | "UPI"
  | "Credit Card"
  | "Debit Card"
  | "Net Banking"
  | "Wallet"
  | "EMI";

export type TransactionType = "Payment" | "Refund" | "Settlement" | "Payout";

export interface Transaction {
  id: string;
  transaction_id: string;
  merchant_id: string;
  customer_id?: string;
  payment_method: PaymentMethod;
  card_network?: string;
  card_bin?: string;
  currency: string;
  amount: number;
  fee: number;
  tax: number;
  net_amount: number;
  status: TransactionStatus;
  transaction_type: TransactionType;
  country: string;
  state?: string;
  city?: string;
  ip_address?: string;
  device_id?: string;
  device_type?: string;
  operating_system?: string;
  browser?: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  reference_number?: string;
  gateway_response?: string;
  failure_reason?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedTransactions {
  items: Transaction[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface TransactionFilterParams {
  search?: string;
  status?: string;
  merchant_id?: string;
  payment_method?: string;
  country?: string;
  transaction_type?: string;
  min_amount?: number;
  max_amount?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  size?: number;
  sort_by?: string;
  sort_dir?: string;
}
