from collections import deque
from typing import Dict, List, Set, Tuple
from app.domain.graph.types import GraphEdge, GraphNode, GraphPayload


class GraphTraversalService:
    @staticmethod
    def get_neighbours(
        nodes: List[GraphNode],
        edges: List[GraphEdge],
        target_node_id: str,
        depth: int = 1,
    ) -> GraphPayload:
        """
        Executes Breadth-First Search (BFS) starting from target_node_id up to specified depth.
        Returns sub-graph payload.
        """
        node_dict = {n.id: n for n in nodes}
        if target_node_id not in node_dict:
            return GraphPayload([], [], 0, 0)

        # Build adjacency graph: node_id -> list of (neighbor_id, edge)
        adj: Dict[str, List[Tuple[str, GraphEdge]]] = {}
        for e in edges:
            adj.setdefault(e.source, []).append((e.target, e))
            adj.setdefault(e.target, []).append((e.source, e))

        visited_nodes: Set[str] = {target_node_id}
        collected_edges: Set[str] = set()

        queue = deque([(target_node_id, 0)])

        while queue:
            curr_id, curr_depth = queue.popleft()
            if curr_depth >= depth:
                continue

            for nxt_id, edge in adj.get(curr_id, []):
                collected_edges.add(edge.id)
                if nxt_id not in visited_nodes:
                    visited_nodes.add(nxt_id)
                    queue.append((nxt_id, curr_depth + 1))

        res_nodes = [node_dict[nid] for nid in visited_nodes if nid in node_dict]
        edge_dict = {e.id: e for e in edges}
        res_edges = [edge_dict[eid] for eid in collected_edges if eid in edge_dict]

        return GraphPayload(
            nodes=res_nodes,
            edges=res_edges,
            total_nodes=len(res_nodes),
            total_edges=len(res_edges),
        )

    @staticmethod
    def find_shortest_path(
        nodes: List[GraphNode],
        edges: List[GraphEdge],
        source_id: str,
        target_id: str,
    ) -> GraphPayload:
        """
        Computes shortest path between source_id and target_id using BFS.
        Returns graph payload containing path nodes and edges.
        """
        node_dict = {n.id: n for n in nodes}
        if source_id not in node_dict or target_id not in node_dict:
            return GraphPayload([], [], 0, 0)

        adj: Dict[str, List[Tuple[str, GraphEdge]]] = {}
        for e in edges:
            adj.setdefault(e.source, []).append((e.target, e))
            adj.setdefault(e.target, []).append((e.source, e))

        queue = deque([[source_id]])
        visited: Set[str] = {source_id}
        edge_map: Dict[Tuple[str, str], GraphEdge] = {}
        for e in edges:
            edge_map[(e.source, e.target)] = e
            edge_map[(e.target, e.source)] = e

        path_found: List[str] = []

        while queue:
            path = queue.popleft()
            curr = path[-1]

            if curr == target_id:
                path_found = path
                break

            for nxt, _ in adj.get(curr, []):
                if nxt not in visited:
                    visited.add(nxt)
                    new_path = list(path) + [nxt]
                    queue.append(new_path)

        if not path_found:
            return GraphPayload([], [], 0, 0)

        res_nodes = [node_dict[nid] for nid in path_found if nid in node_dict]
        res_edges: List[GraphEdge] = []

        for i in range(len(path_found) - 1):
            u, v = path_found[i], path_found[i + 1]
            e = edge_map.get((u, v))
            if e:
                res_edges.append(e)

        return GraphPayload(
            nodes=res_nodes,
            edges=res_edges,
            total_nodes=len(res_nodes),
            total_edges=len(res_edges),
        )
