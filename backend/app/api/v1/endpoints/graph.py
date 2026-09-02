from typing import Any, Optional
from fastapi import APIRouter, Depends, Query, status
from app.core.deps import get_current_active_user, get_graph_service
from app.core.response import APIResponse, success_response
from app.models.user import User
from app.schemas.graph import (
    GraphExpandRequest,
    GraphNodeSchema,
    GraphPathRequest,
    GraphPayloadResponse,
)
from app.services.graph_service import GraphService

router = APIRouter()


@router.get(
    "",
    response_model=APIResponse[GraphPayloadResponse],
    summary="Get full or filtered relationship graph snapshot",
)
@router.get(
    "/snapshot",
    response_model=APIResponse[GraphPayloadResponse],
    summary="Get full or filtered relationship graph snapshot",
)
async def get_graph(
    limit: int = Query(50, ge=5, le=500, description="Max transaction records to process"),
    node_type: Optional[str] = Query(None, description="Filter by node type (MERCHANT, CUSTOMER, DEVICE, TRANSACTION, etc.)"),
    relationship: Optional[str] = Query(None, description="Filter by relationship type (OWNS, MADE, USED_FOR, etc.)"),
    current_user: User = Depends(get_current_active_user),
    service: GraphService = Depends(get_graph_service),
) -> Any:
    result = await service.get_graph(
        limit_txns=limit,
        node_type_filter=node_type,
        relationship_filter=relationship,
    )
    return success_response(
        data=result,
        message="Relationship graph snapshot retrieved successfully",
    )


@router.get(
    "/nodes",
    summary="Get relationship graph nodes",
)
async def get_graph_nodes(
    limit: int = Query(50, ge=5, le=500),
    current_user: User = Depends(get_current_active_user),
    service: GraphService = Depends(get_graph_service),
) -> Any:
    result = await service.get_graph(limit_txns=limit)
    return success_response(
        data=result.nodes,
        message="Graph nodes retrieved successfully",
    )


@router.get(
    "/relationships",
    summary="Get relationship graph edges",
)
async def get_graph_relationships(
    limit: int = Query(50, ge=5, le=500),
    current_user: User = Depends(get_current_active_user),
    service: GraphService = Depends(get_graph_service),
) -> Any:
    result = await service.get_graph(limit_txns=limit)
    return success_response(
        data=result.edges,
        message="Graph relationships retrieved successfully",
    )


@router.get(
    "/entity/{id}",
    response_model=APIResponse[GraphNodeSchema],
    summary="Get single graph node details by node ID",
)
async def get_node_detail(
    id: str,
    current_user: User = Depends(get_current_active_user),
    service: GraphService = Depends(get_graph_service),
) -> Any:
    result = await service.get_node_detail(id)
    return success_response(
        data=result,
        message="Graph node detail retrieved successfully",
    )


@router.get(
    "/neighbours/{id}",
    response_model=APIResponse[GraphPayloadResponse],
    summary="Get N-hop neighbour graph surrounding a target node ID",
)
async def get_neighbours(
    id: str,
    max_hops: int = Query(2, ge=1, le=5),
    current_user: User = Depends(get_current_active_user),
    service: GraphService = Depends(get_graph_service),
) -> Any:
    result = await service.get_neighbours(id, max_hops=max_hops)
    return success_response(
        data=result,
        message="Neighbour graph retrieved successfully",
    )


@router.post(
    "/expand",
    response_model=APIResponse[GraphPayloadResponse],
    summary="Expand graph surrounding node IDs",
)
async def expand_graph(
    body: GraphExpandRequest,
    current_user: User = Depends(get_current_active_user),
    service: GraphService = Depends(get_graph_service),
) -> Any:
    result = await service.expand_graph(body.node_ids, max_hops=body.max_hops)
    return success_response(
        data=result,
        message="Graph expanded successfully",
    )


@router.post(
    "/path",
    response_model=APIResponse[GraphPayloadResponse],
    summary="Find shortest relationship path between two node IDs",
)
async def find_shortest_path(
    body: GraphPathRequest,
    current_user: User = Depends(get_current_active_user),
    service: GraphService = Depends(get_graph_service),
) -> Any:
    result = await service.find_shortest_path(body.source_node_id, body.target_node_id)
    return success_response(
        data=result,
        message="Shortest path calculated successfully",
    )
