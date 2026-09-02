import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { useToast } from "@/components/ui/toast";
import {
  CompositePredictionRecord,
  OrchestratorFilterParams,
  PaginatedCompositePredictions,
} from "@/types/orchestrator";
import { OrchestratorFormValues } from "@/validators/orchestrator";
import { APIResponse } from "@/types/auth";

export function useOrchestrations(params: OrchestratorFilterParams = {}) {
  return useQuery<PaginatedCompositePredictions>({
    queryKey: ["orchestrations", params],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<PaginatedCompositePredictions>>(
        "/orchestrator/history",
        { params }
      );
      return response.data.data!;
    },
  });
}

export function useOrchestrationDetail(id: string) {
  return useQuery<CompositePredictionRecord>({
    queryKey: ["orchestration_detail", id],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<CompositePredictionRecord>>(
        `/orchestrator/history/${id}`
      );
      return response.data.data!;
    },
    enabled: !!id,
  });
}

export function useOrchestratePredict() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (values: OrchestratorFormValues) => {
      const response = await apiClient.post<APIResponse<CompositePredictionRecord>>(
        "/orchestrator/predict",
        values
      );
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["orchestrations"] });
      showToast("Multi-model AI orchestration pipeline executed successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "AI orchestration pipeline execution failed.";
      showToast(msg, "error");
    },
  });
}
