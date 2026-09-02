export type ModelType =
  | "Fraud Detection"
  | "Chargeback Prediction"
  | "Merchant Risk"
  | "Customer Risk"
  | "Device Risk"
  | "Behaviour Analysis";

export type ModelFramework =
  | "Joblib"
  | "ONNX"
  | "TensorFlow"
  | "PyTorch"
  | "XGBoost"
  | "LightGBM";

export type ModelStatus = "Draft" | "Active" | "Inactive" | "Archived";

export interface ModelRegistryRecord {
  id: string;
  model_id: string;
  model_name: string;
  model_type: ModelType;
  business_domain: string;
  version: string;
  framework: ModelFramework;
  algorithm: string;
  description?: string;
  model_status: ModelStatus;
  production_flag: boolean;
  training_dataset_version: string;
  feature_version: string;
  input_schema_version: string;
  output_schema_version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  latency_ms: number;
  owner: string;
  metadata_json: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaginatedModelRegistry {
  items: ModelRegistryRecord[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ModelFilterParams {
  search?: string;
  model_type?: ModelType;
  framework?: ModelFramework;
  model_status?: ModelStatus;
  production_flag?: boolean;
  page?: number;
  size?: number;
  sort_by?: string;
  sort_dir?: string;
}
