export interface DemoIngestRequest {
  dataset_scale: "enterprise_250k" | "standard_50k" | "express_10k";
  include_fraud_scenarios: boolean;
  auto_run_ai_pipeline: boolean;
}

export interface DemoIngestStageResult {
  stage: string;
  status: "COMPLETED" | "IN_PROGRESS" | "FAILED";
  count: number;
  duration_ms: number;
  description: string;
}

export interface DemoIngestResponse {
  batch_id: string;
  scale: string;
  merchants_count: number;
  customers_count: number;
  devices_count: number;
  transactions_count: number;
  features_count: number;
  predictions_count: number;
  decisions_count: number;
  cases_count: number;
  graph_nodes_count: number;
  graph_edges_count: number;
  notifications_count: number;
  stages: DemoIngestStageResult[];
  total_duration_ms: number;
  summary_message: string;
}

export interface FileParseResponse {
  filename: string;
  file_type: string;
  extracted_files: string[];
  detected_entity_type: string;
  total_rows: number;
  total_columns: number;
  columns: string[];
  detected_schema: Record<string, string>;
  quality_score: number;
  missing_values_count: number;
  duplicate_rows_count: number;
  validation_warnings: string[];
  sample_records: Record<string, any>[];
}

export interface BatchIngestRequest {
  entity_type: string;
  filename: string;
  records: Record<string, any>[];
  column_mapping?: Record<string, string>;
  run_ai_pipeline: boolean;
}

export interface BatchIngestResponse {
  import_id: string;
  entity_type: string;
  total_received: number;
  successfully_imported: number;
  skipped_records: number;
  features_generated: number;
  ai_predictions_evaluated: number;
  decisions_produced: number;
  cases_opened: number;
  duration_ms: number;
  status: string;
  message: string;
}

export interface ImportHistoryItem {
  import_id: string;
  filename: string;
  source_type: string;
  entity_type: string;
  rows_processed: number;
  rows_skipped: number;
  quality_score: number;
  duration_ms: number;
  status: string;
  created_at: string;
  imported_by: string;
}

export interface PaginatedImportHistoryResponse {
  items: ImportHistoryItem[];
  total: number;
  page: number;
  size: number;
}
