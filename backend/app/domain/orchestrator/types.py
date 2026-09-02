from dataclasses import dataclass, field
from datetime import datetime, timezone
import enum
from typing import Any, Dict, List, Optional
from app.models.model_registry import ModelRegistry, ModelType


class ExecutionMode(str, enum.Enum):
    PARALLEL = "PARALLEL"
    SEQUENTIAL = "SEQUENTIAL"
    CONDITIONAL = "CONDITIONAL"
    FALLBACK = "FALLBACK"


class StepStatus(str, enum.Enum):
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"
    FALLBACK = "FALLBACK"


@dataclass
class ExecutionContext:
    transaction_id: str
    executor_user_id: str
    feature_payload: Dict[str, Any] = field(default_factory=dict)
    feature_vector_id: Optional[str] = None
    feature_version: str = "v1.0"
    trace_id: str = field(default_factory=lambda: f"TRC-{datetime.now(timezone.utc).timestamp()}")


@dataclass
class ModelExecutionResult:
    model_id: str
    model_name: str
    model_type: str
    model_version: str
    framework: str
    raw_result: str  # ALLOW, FLAG, BLOCK
    score: float  # 0.0 to 100.0
    confidence: float  # 0.0 to 1.0
    latency_ms: float
    status: StepStatus = StepStatus.SUCCESS
    error_message: Optional[str] = None
    evaluated_features_count: int = 0


@dataclass
class ExecutionStep:
    step_id: str
    model_type: ModelType
    target_model: Optional[ModelRegistry] = None
    fallback_model: Optional[ModelRegistry] = None
    execution_mode: ExecutionMode = ExecutionMode.PARALLEL
    timeout_ms: float = 50.0
    retry_count: int = 1
    condition_expression: Optional[str] = None


@dataclass
class ExecutionPlan:
    plan_id: str
    steps: List[ExecutionStep] = field(default_factory=list)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class ModelWeight:
    model_type: str
    weight: float
