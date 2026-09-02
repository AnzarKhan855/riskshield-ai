import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { useToast } from "@/components/ui/toast";
import { GraphFilterParams, GraphPayloadData, GraphNodeRecord } from "@/types/graph";
import { APIResponse } from "@/types/auth";

export function useGraphSnapshot(params: GraphFilterParams = {}) {
  return useQuery<GraphPayloadData>({
    queryKey: ["graph_snapshot", params],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<GraphPayloadData>>("/graph", {
        params,
      });
      return response.data.data!;
    },
  });
}

export function useNeighbours(nodeId: string, depth: number = 1) {
  return useQuery<GraphPayloadData>({
    queryKey: ["graph_neighbours", nodeId, depth],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<GraphPayloadData>>(
        `/graph/neighbours/${nodeId}?depth=${depth}`
      );
      return response.data.data!;
    },
    enabled: !!nodeId,
  });
}

export function useShortestPath(sourceId?: string, targetId?: string) {
  return useQuery<GraphPayloadData>({
    queryKey: ["graph_shortest_path", sourceId, targetId],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<GraphPayloadData>>(
        `/graph/path?source_id=${sourceId}&target_id=${targetId}`
      );
      return response.data.data!;
    },
    enabled: !!sourceId && !!targetId,
  });
}

export function useExpandNode() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ nodeId, depth }: { nodeId: string; depth: number }) => {
      const response = await apiClient.post<APIResponse<GraphPayloadData>>("/graph/expand", {
        node_id: nodeId,
        depth: depth,
      });
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["graph_snapshot"] });
      showToast("Graph node expanded successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to expand graph node.";
      showToast(msg, "error");
    },
  });
}
