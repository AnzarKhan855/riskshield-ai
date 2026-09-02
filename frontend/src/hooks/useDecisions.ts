import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { useToast } from "@/components/ui/toast";
import { DecisionFilterParams, DecisionRecord, PaginatedDecisions } from "@/types/decision";
import { DecisionEvaluateFormValues } from "@/validators/decision";
import { APIResponse } from "@/types/auth";

export function useDecisions(params: DecisionFilterParams = {}) {
  return useQuery<PaginatedDecisions>({
    queryKey: ["decisions", params],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<PaginatedDecisions>>("/decisions", {
        params,
      });
      return response.data.data!;
    },
  });
}

export function useDecisionDetail(id: string) {
  return useQuery<DecisionRecord>({
    queryKey: ["decision_detail", id],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<DecisionRecord>>(`/decisions/${id}`);
      return response.data.data!;
    },
    enabled: !!id,
  });
}

export function useEvaluateDecision() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (values: DecisionEvaluateFormValues) => {
      const response = await apiClient.post<APIResponse<DecisionRecord>>(
        "/decisions/evaluate",
        values
      );
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
      showToast("Decision Intelligence evaluation completed successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Decision evaluation failed.";
      showToast(msg, "error");
    },
  });
}
