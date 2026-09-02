export interface FeatureStoreRecord {
  id: string;
  feature_vector_id: string;
  transaction_id: string;
  merchant_id?: string;
  customer_id?: string;
  device_id?: string;
  feature_version: string;
  feature_group: string;
  feature_count: number;
  feature_payload: Record<string, any>;
  prediction_ready: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedFeatureStore {
  items: FeatureStoreRecord[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface FeatureFilterParams {
  transaction_id?: string;
  feature_version?: string;
  prediction_ready?: boolean;
  page?: number;
  size?: number;
  sort_by?: string;
  sort_dir?: string;
}
