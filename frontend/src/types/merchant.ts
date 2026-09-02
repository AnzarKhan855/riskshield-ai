export type BusinessType =
  | "Sole Proprietorship"
  | "Partnership"
  | "Private Limited"
  | "Public Limited"
  | "LLC"
  | "Other";

export type MerchantStatus =
  | "Active"
  | "Inactive"
  | "Suspended"
  | "Pending Approval";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type VerificationStatus =
  | "Unverified"
  | "Pending"
  | "Verified"
  | "Rejected";

export type KYCStatus = "Not Submitted" | "Pending" | "Approved" | "Rejected";

export interface Merchant {
  id: string;
  business_name: string;
  legal_business_name: string;
  merchant_code: string;
  owner_user_id: string;
  business_type: BusinessType;
  industry: string;
  gst_number?: string;
  pan_number?: string;
  business_email: string;
  business_phone: string;
  website?: string;
  country: string;
  state: string;
  city: string;
  address: string;
  pincode: string;
  status: MerchantStatus;
  risk_level: RiskLevel;
  verification_status: VerificationStatus;
  kyc_status: KYCStatus;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedMerchants {
  items: Merchant[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface MerchantFilterParams {
  search?: string;
  status?: string;
  risk_level?: string;
  verification_status?: string;
  industry?: string;
  page?: number;
  size?: number;
  sort_by?: string;
  sort_dir?: string;
}
