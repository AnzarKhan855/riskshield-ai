"""
RiskShield AI Core Constants & Enumerations.
Centralizes standardized domain actions, priority definitions, and SLA thresholds.
"""
from enum import Enum


class DecisionAction(str, Enum):
    """Supported automated decision actions emitted by the Decision Engine."""
    APPROVE = "APPROVE"
    REVIEW = "REVIEW"
    BLOCK = "BLOCK"
    ESCALATE = "ESCALATE"


class CasePriority(str, Enum):
    """Investigation case triage priorities."""
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class CaseStatus(str, Enum):
    """Investigation case lifecycle states."""
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class ModelFrameworkType(str, Enum):
    """Supported machine learning frameworks."""
    XGBOOST = "XGBoost"
    LIGHTGBM = "LightGBM"
    ONNX = "ONNX"
    PYTORCH = "PyTorch"
    SCIKIT_LEARN = "Scikit-Learn"


# Latency and System Thresholds
DECISION_SLA_P99_MS = 15.0
DEFAULT_CACHE_TTL_SECONDS = 86400  # 24 hours
RATE_LIMIT_DEFAULT_REQUESTS = 500
RATE_LIMIT_WINDOW_SECONDS = 60
