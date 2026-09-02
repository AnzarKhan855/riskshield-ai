import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class RuleCreateRequest(BaseModel):
    rule_name: str = Field(..., min_length=2, max_length=100, example="High Risk Country Block Rule")
    rule_category: str = Field(..., example="COUNTRY", description="MERCHANT, CUSTOMER, TRANSACTION, COUNTRY, VELOCITY, PAYMENT_METHOD, COMPLIANCE, REGULATORY, AMOUNT, TIME, DEVICE, BEHAVIOUR")
    priority: int = Field(100, ge=1, le=1000, description="Rule priority (lower integer = higher priority)")
    version: str = Field("v1.0.0", example="v1.0.0")
    status: str = Field("PUBLISHED", example="PUBLISHED")
    description: Optional[str] = Field(None, max_length=255)
    expression: str = Field(..., example="loc_is_high_risk_country == True", description="Boolean evaluation expression")
    action: str = Field(..., example="BLOCK", description="APPROVE, REVIEW, BLOCK, ESCALATE")
    severity: str = Field("HIGH", example="HIGH", description="LOW, MEDIUM, HIGH, CRITICAL")
    enabled: bool = Field(True)
    created_by: str = Field("Risk Policy Team", max_length=100)


class RuleUpdateRequest(BaseModel):
    rule_name: Optional[str] = Field(None, min_length=2, max_length=100)
    rule_category: Optional[str] = None
    priority: Optional[int] = Field(None, ge=1, le=1000)
    status: Optional[str] = None
    description: Optional[str] = Field(None, max_length=255)
    expression: Optional[str] = None
    action: Optional[str] = None
    severity: Optional[str] = None
    enabled: Optional[bool] = None


class RuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    rule_id: str
    rule_name: str
    rule_category: str
    priority: int
    version: str
    status: str
    description: Optional[str] = None
    expression: str
    action: str
    severity: str
    enabled: bool
    created_by: str
    created_at: datetime
    updated_at: datetime


class PaginatedRuleResponse(BaseModel):
    items: List[RuleResponse]
    total: int
    page: int
    size: int
    pages: int


class RuleSimulateRequest(BaseModel):
    expression: str = Field(..., example="amount > 5000 and customer_risk_score > 0.7")
    transaction_data: Optional[dict] = Field(default_factory=dict)


class RuleSimulateResponse(BaseModel):
    matched: bool
    details: str
    expression: str


class RuleValidateRequest(BaseModel):
    expression: str = Field(..., example="amount > 1000 and is_foreign_transaction == true")


class RuleValidateResponse(BaseModel):
    is_valid: bool
    message: str
