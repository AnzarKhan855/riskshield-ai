import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { useToast } from "@/components/ui/toast";
import {
  ExplanationFilterParams,
  ExplanationRecord,
  PaginatedExplanations,
} from "@/types/explanation";
import { APIResponse } from "@/types/auth";

export function useExplanations(params: ExplanationFilterParams = {}) {
  return useQuery<PaginatedExplanations>({
    queryKey: ["explanations", params],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<PaginatedExplanations>>("/explanations", {
        params,
      });
      return response.data.data!;
    },
  });
}

export function useExplanation(decisionId: string) {
  return useQuery<ExplanationRecord>({
    queryKey: ["explanation", decisionId],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<ExplanationRecord>>(`/explanations/${decisionId}`);
      return response.data.data!;
    },
    enabled: !!decisionId,
  });
}

export function useGenerateExplanation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (decisionId: string) => {
      const response = await apiClient.post<APIResponse<ExplanationRecord>>("/explanations/generate", {
        decision_id: decisionId,
      });
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["explanations"] });
      showToast("AI Explanation payload generated!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to generate explanation.";
      showToast(msg, "error");
    },
  });
}
