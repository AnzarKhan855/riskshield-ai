import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CaseCreateRequest(BaseModel):
    transaction_id: str = Field(..., example="TXN-8D93240D", description="Target Transaction ID")
    decision_id: Optional[str] = Field(None, example="DEC-8B13D12B", description="Optional Decision ID")
    category: str = Field("Fraud", example="Fraud", description="Fraud, Chargeback, AML, Compliance, Identity, Merchant Abuse, Promotion Abuse")
    priority: str = Field("HIGH", example="HIGH", description="LOW, MEDIUM, HIGH, CRITICAL")
    case_title: str = Field(..., example="Suspicious High-Value Card Transaction", description="Brief case summary title")
    case_description: Optional[str] = Field(None, description="Detailed case notes/context")


class CaseAssignRequest(BaseModel):
    analyst_id: uuid.UUID
    analyst_name: str


class CaseResolveRequest(BaseModel):
    resolution: str = Field(..., example="REJECT", description="APPROVE, REJECT, ESCALATE, CLOSE")
    resolution_notes: str = Field(..., min_length=5, description="Analyst justification notes for resolution")


class EvidenceCreateRequest(BaseModel):
    evidence_type: str = Field(..., example="DECISION_RULES", description="MERCHANT_PROFILE, CUSTOMER_METRICS, DEVICE_TELEMETRY, DECISION_RULES, AI_PREDICTION, LOCATION")
    title: str = Field(..., example="Triggered Decision Rules Evidence")
    description: Optional[str] = None
    reference_id: Optional[str] = None
    metadata_json: Dict[str, Any] = Field(default_factory=dict)


class EvidenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    evidence_id: str
    case_id: uuid.UUID
    evidence_type: str
    title: str
    description: Optional[str] = None
    reference_id: Optional[str] = None
    metadata_json: Dict[str, Any]
    created_by: str
    created_at: datetime


class CommentCreateRequest(BaseModel):
    comment: str = Field(..., min_length=2, max_length=1000, description="Analyst investigation note")


class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    comment_id: str
    case_id: uuid.UUID
    author_id: uuid.UUID
    author_name: str
    comment: str
    created_at: datetime


class TimelineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    timeline_id: str
    case_id: uuid.UUID
    action: str
    actor: str
    details: Dict[str, Any]
    created_at: datetime


class InvestigationCaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    case_id: str
    decision_id: Optional[str] = None
    transaction_id: str
    merchant_id: Optional[uuid.UUID] = None
    customer_id: Optional[str] = None
    assigned_analyst_id: Optional[uuid.UUID] = None
    assigned_analyst_name: Optional[str] = None
    priority: str
    status: str
    category: str
    severity: str
    case_title: str
    case_description: Optional[str] = None
    resolution: Optional[str] = None
    resolution_notes: Optional[str] = None
    opened_at: datetime
    assigned_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    case_metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime


class CaseWorkspaceResponse(BaseModel):
    case_details: InvestigationCaseResponse
    evidence_list: List[EvidenceResponse]
    comments_list: List[CommentResponse]
    timeline_list: List[TimelineResponse]
    decision_summary: Optional[Dict[str, Any]] = None
    transaction_summary: Optional[Dict[str, Any]] = None


class PaginatedCasesResponse(BaseModel):
    items: List[InvestigationCaseResponse]
    total: int
    page: int
    size: int
    pages: int
