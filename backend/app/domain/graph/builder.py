import secrets
from typing import Any, Dict, Optional
from app.domain.graph.types import (
    GraphEdge,
    GraphNode,
    NodeType,
    RelationshipType,
)


class RelationshipBuilderService:
    @staticmethod
    def create_node(
        node_id: str,
        label: str,
        node_type: NodeType,
        risk_score: float = 0.0,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> GraphNode:
        if risk_score >= 80.0:
            level = "CRITICAL"
        elif risk_score >= 60.0:
            level = "HIGH"
        elif risk_score >= 35.0:
            level = "MEDIUM"
        else:
            level = "LOW"

        return GraphNode(
            id=node_id,
            label=label,
            type=node_type,
            risk_score=risk_score,
            risk_level=level,
            metadata=metadata or {},
        )

    @staticmethod
    def create_edge(
        source_id: str,
        target_id: str,
        relationship: RelationshipType,
        label: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> GraphEdge:
        edge_id = f"EDGE-{secrets.token_hex(4).upper()}"
        return GraphEdge(
            id=edge_id,
            source=source_id,
            target=target_id,
            relationship=relationship,
            label=label,
            metadata=metadata or {},
        )
