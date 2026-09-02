from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class GraphNodeSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    label: str
    type: str
    risk_score: float
    risk_level: str
    metadata: Dict[str, Any]
    icon: Optional[str] = None


class GraphEdgeSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    source: str
    target: str
    relationship: str
    label: str
    weight: float
    metadata: Dict[str, Any]


class GraphPayloadResponse(BaseModel):
    nodes: List[GraphNodeSchema]
    edges: List[GraphEdgeSchema]
    total_nodes: int
    total_edges: int


class GraphExpandRequest(BaseModel):
    node_id: str = Field(..., example="txn_TXN-8D93240D", description="Target node ID to expand")
    depth: int = Field(1, ge=1, le=5, description="Expansion depth limit")


class GraphPathRequest(BaseModel):
    source_id: str = Field(..., example="mrc_MRC-001")
    target_id: str = Field(..., example="case_CASE-101")
