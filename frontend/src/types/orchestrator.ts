export interface IndividualModelResult {
  model_id: string;
  model_name: string;
  framework: string;
  raw_result: string; // ALLOW, FLAG, BLOCK
  score: number; // 0.0 to 100.0
  confidence: number;
  latency_ms: number;
  status: string; // SUCCESS, FAILED, SKIPPED, FALLBACK
  error_message?: string;
}

export interface CompositePredictionRecord {
  id: string;
  prediction_id: string;
  transaction_id: string;
  feature_vector_id?: string;
  overall_risk_score: number;
  confidence: number;
  composite_risk_level: string; // LOW, MEDIUM, HIGH, CRITICAL
  executed_models: string[];
  execution_time_ms: number;
  individual_results: Record<string, IndividualModelResult>;
  feature_version: string;
  model_versions: Record<string, string>;
  metadata_json: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaginatedCompositePredictions {
  items: CompositePredictionRecord[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface OrchestratorFilterParams {
  transaction_id?: string;
  composite_risk_level?: string;
  page?: number;
  size?: number;
  sort_by?: string;
  sort_dir?: string;
}
