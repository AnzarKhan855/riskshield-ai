import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class DemoIngestRequest(BaseModel):
    dataset_scale: str = Field(default="enterprise_250k", description="Scale of demo dataset: express_10k | standard_50k | enterprise_250k")
    include_fraud_scenarios: bool = Field(default=True, description="Include realistic attack vectors: Card testing, Account takeover, Velocity spike, etc.")
    auto_run_ai_pipeline: bool = Field(default=True, description="Automatically calculate features, AI models, decisions, and graph links")


class DemoIngestStageResult(BaseModel):
    stage: str
    status: str = Field(default="COMPLETED")
    count: int
    duration_ms: float
    description: str


class DemoIngestResponse(BaseModel):
    batch_id: str
    scale: str
    merchants_count: int
    customers_count: int
    devices_count: int
    transactions_count: int
    features_count: int
    predictions_count: int
    decisions_count: int
    cases_count: int
    graph_nodes_count: int
    graph_edges_count: int
    notifications_count: int
    stages: List[DemoIngestStageResult]
    total_duration_ms: float
    summary_message: str


class FileParseResponse(BaseModel):
    filename: str
    file_type: str
    extracted_files: List[str] = Field(default_factory=list)
    detected_entity_type: str
    total_rows: int
    total_columns: int
    columns: List[str]
    detected_schema: Dict[str, str]
    quality_score: float
    missing_values_count: int
    duplicate_rows_count: int
    validation_warnings: List[str] = Field(default_factory=list)
    sample_records: List[Dict[str, Any]] = Field(default_factory=list)


class BatchIngestRequest(BaseModel):
    entity_type: str = Field(default="TRANSACTIONS", description="TRANSACTIONS | CUSTOMERS | MERCHANTS | DEVICES")
    filename: str
    records: List[Dict[str, Any]]
    column_mapping: Optional[Dict[str, str]] = None
    run_ai_pipeline: bool = Field(default=True)


class BatchIngestResponse(BaseModel):
    import_id: str
    entity_type: str
    total_received: int
    successfully_imported: int
    skipped_records: int
    features_generated: int
    ai_predictions_evaluated: int
    decisions_produced: int
    cases_opened: int
    duration_ms: float
    status: str
    message: str


class ImportHistoryItem(BaseModel):
    import_id: str
    filename: str
    source_type: str
    entity_type: str
    rows_processed: int
    rows_skipped: int
    quality_score: float
    duration_ms: float
    status: str
    created_at: datetime
    imported_by: str


class PaginatedImportHistoryResponse(BaseModel):
    items: List[ImportHistoryItem]
    total: int
    page: int
    size: int
