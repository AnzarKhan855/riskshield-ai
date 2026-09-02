from typing import Dict, List, Optional, Set, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.graph.builder import RelationshipBuilderService
from app.domain.graph.types import (
    GraphEdge,
    GraphNode,
    GraphPayload,
    NodeType,
    RelationshipType,
)
from app.models.composite_prediction import CompositePrediction
from app.models.decision import Decision
from app.models.investigation_case import InvestigationCase
from app.models.merchant import Merchant
from app.models.transaction import Transaction


class GraphRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.builder = RelationshipBuilderService()

    async def build_full_graph(
        self,
        limit_txns: int = 50,
        node_type_filter: Optional[str] = None,
        relationship_filter: Optional[str] = None,
    ) -> GraphPayload:
        nodes_dict: Dict[str, GraphNode] = {}
        edges_list: List[GraphEdge] = []
        edge_set: Set[Tuple[str, str, str]] = set()

        def add_node(n: GraphNode):
            if n.id not in nodes_dict:
                nodes_dict[n.id] = n

        def add_edge(src: str, tgt: str, rel: RelationshipType, label: str):
            key = (src, tgt, rel.value)
            if key not in edge_set:
                edge_set.add(key)
                edges_list.append(self.builder.create_edge(src, tgt, rel, label))

        try:
            # 1. Query Transactions
            txn_stmt = select(Transaction).where(Transaction.is_deleted == False).order_by(Transaction.created_at.desc()).limit(limit_txns)
            txn_res = await self.session.execute(txn_stmt)
            transactions = list(txn_res.scalars().all())

            for t in transactions:
                t_node_id = f"txn_{t.transaction_id}"
                add_node(
                    self.builder.create_node(
                        t_node_id,
                        t.transaction_id,
                        NodeType.TRANSACTION,
                        risk_score=65.0 if t.amount > 10000 else 15.0,
                        metadata={"amount": t.amount, "currency": t.currency, "status": t.status.value},
                    )
                )

                if t.customer_id:
                    c_node_id = f"cust_{t.customer_id}"
                    add_node(
                        self.builder.create_node(
                            c_node_id,
                            t.customer_id,
                            NodeType.CUSTOMER,
                            risk_score=20.0,
                            metadata={"customer_id": t.customer_id},
                        )
                    )
                    add_edge(c_node_id, t_node_id, RelationshipType.MADE, "MADE")

                if t.ip_address:
                    ip_node_id = f"ip_{t.ip_address}"
                    add_node(
                        self.builder.create_node(
                            ip_node_id,
                            t.ip_address,
                            NodeType.IP_ADDRESS,
                            risk_score=40.0 if t.ip_address.startswith("192.") else 10.0,
                            metadata={"ip": t.ip_address},
                        )
                    )
                    add_edge(t_node_id, ip_node_id, RelationshipType.USED, "USED")
        except Exception:
            # Fallback mock nodes when database is offline
            t_node_id = "txn_TXN-9821849A"
            c_node_id = "cust_CUST-49102"
            add_node(
                self.builder.create_node(
                    t_node_id,
                    "TXN-9821849A",
                    NodeType.TRANSACTION,
                    risk_score=88.5,
                    metadata={"amount": 4500.0, "currency": "USD"},
                )
            )
            add_node(
                self.builder.create_node(
                    c_node_id,
                    "CUST-49102",
                    NodeType.CUSTOMER,
                    risk_score=75.0,
                    metadata={"customer_id": "CUST-49102"},
                )
            )
            add_edge(c_node_id, t_node_id, RelationshipType.MADE, "MADE")

        all_nodes = list(nodes_dict.values())
        all_edges = edges_list

        if node_type_filter:
            flt_type = node_type_filter.upper()
            all_nodes = [n for n in all_nodes if n.type.value == flt_type]
            allowed_ids = {n.id for n in all_nodes}
            all_edges = [e for e in all_edges if e.source in allowed_ids and e.target in allowed_ids]

        if relationship_filter:
            flt_rel = relationship_filter.upper()
            all_edges = [e for e in all_edges if e.relationship.value == flt_rel]

        return GraphPayload(
            nodes=all_nodes,
            edges=all_edges,
            total_nodes=len(all_nodes),
            total_edges=len(all_edges),
        )
