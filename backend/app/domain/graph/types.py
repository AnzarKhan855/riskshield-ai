from dataclasses import dataclass, field
import enum
from typing import Any, Dict, List, Optional


class NodeType(str, enum.Enum):
    MERCHANT = "MERCHANT"
    CUSTOMER = "CUSTOMER"
    DEVICE = "DEVICE"
    TRANSACTION = "TRANSACTION"
    DECISION = "DECISION"
    CASE = "CASE"
    IP_ADDRESS = "IP_ADDRESS"
    CARD_BIN = "CARD_BIN"
    COUNTRY = "COUNTRY"
    PAYMENT_METHOD = "PAYMENT_METHOD"


class RelationshipType(str, enum.Enum):
    OWNS = "OWNS"
    MADE = "MADE"
    USED_FOR = "USED_FOR"
    GENERATED = "GENERATED"
    CREATED = "CREATED"
    USED = "USED"
    CONNECTED_TO = "CONNECTED_TO"
    LOCATED_IN = "LOCATED_IN"
    CONNECTED_FROM = "CONNECTED_FROM"


@dataclass
class GraphNode:
    id: str
    label: str
    type: NodeType
    risk_score: float = 0.0
    risk_level: str = "LOW"  # LOW, MEDIUM, HIGH, CRITICAL
    metadata: Dict[str, Any] = field(default_factory=dict)
    icon: Optional[str] = None


@dataclass
class GraphEdge:
    id: str
    source: str
    target: str
    relationship: RelationshipType
    label: str
    weight: float = 1.0
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class GraphPayload:
    nodes: List[GraphNode] = field(default_factory=list)
    edges: List[GraphEdge] = field(default_factory=list)
    total_nodes: int = 0
    total_edges: int = 0
