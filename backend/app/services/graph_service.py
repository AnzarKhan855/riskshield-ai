from typing import List, Optional
from app.core.exceptions import NotFoundException
from app.domain.graph.traversal import GraphTraversalService
from app.domain.graph.types import GraphPayload
from app.repositories.audit_repository import AuditLogRepository
from app.repositories.graph_repository import GraphRepository
from app.schemas.graph import GraphPayloadResponse, GraphNodeSchema, GraphEdgeSchema


class GraphService:
    def __init__(
        self,
        graph_repo: GraphRepository,
        audit_repo: AuditLogRepository,
    ):
        self.graph_repo = graph_repo
        self.audit_repo = audit_repo
        self.traversal = GraphTraversalService()

    def _to_response(self, payload: GraphPayload) -> GraphPayloadResponse:
        nodes = [GraphNodeSchema.model_validate(n) for n in payload.nodes]
        edges = [GraphEdgeSchema.model_validate(e) for e in payload.edges]
        return GraphPayloadResponse(
            nodes=nodes,
            edges=edges,
            total_nodes=payload.total_nodes,
            total_edges=payload.total_edges,
        )

    async def get_graph(
        self,
        limit_txns: int = 50,
        node_type_filter: Optional[str] = None,
        relationship_filter: Optional[str] = None,
    ) -> GraphPayloadResponse:
        """Fetch full or filtered graph snapshot."""
        payload = await self.graph_repo.build_full_graph(
            limit_txns=limit_txns,
            node_type_filter=node_type_filter,
            relationship_filter=relationship_filter,
        )
        return self._to_response(payload)

    async def get_neighbours(
        self, node_id: str, depth: int = 1
    ) -> GraphPayloadResponse:
        """Fetch N-hop neighbor graph surrounding a target node."""
        full_payload = await self.graph_repo.build_full_graph(limit_txns=100)
        sub_payload = self.traversal.get_neighbours(
            full_payload.nodes, full_payload.edges, node_id, depth
        )
        return self._to_response(sub_payload)

    async def get_node_detail(self, node_id: str) -> GraphNodeSchema:
        """Fetch single graph node details."""
        full_payload = await self.graph_repo.build_full_graph(limit_txns=100)
        for n in full_payload.nodes:
            if n.id == node_id:
                return GraphNodeSchema.model_validate(n)
        raise NotFoundException(f"Graph node '{node_id}' not found.")

    async def find_shortest_path(
        self, source_id: str, target_id: str
    ) -> GraphPayloadResponse:
        """Calculate shortest path between source_id and target_id."""
        full_payload = await self.graph_repo.build_full_graph(limit_txns=100)
        path_payload = self.traversal.find_shortest_path(
            full_payload.nodes, full_payload.edges, source_id, target_id
        )
        return self._to_response(path_payload)

    async def expand_node(
        self, node_id: str, depth: int = 1
    ) -> GraphPayloadResponse:
        """Expand node relationships."""
        return await self.get_neighbours(node_id, depth)
