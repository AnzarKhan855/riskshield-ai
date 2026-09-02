export interface PredictionRecord {
  id: string;
  prediction_id: string;
  model_id: string;
  transaction_id: string;
  feature_vector_id?: string;
  prediction_timestamp: string;
  inference_time_ms: number;
  prediction_result: string; // ALLOW, FLAG, BLOCK
  confidence_score: number;
  decision_status: string;
  feature_version: string;
  model_version: string;
  latency_ms: number;
  raw_output_json: Record<string, any>;
  audit_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaginatedPredictions {
  items: PredictionRecord[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface PredictionFilterParams {
  transaction_id?: string;
  model_id?: string;
  prediction_result?: string;
  page?: number;
  size?: number;
  sort_by?: string;
  sort_dir?: string;
}
