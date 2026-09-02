import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { useToast } from "@/components/ui/toast";
import {
  PaginatedPredictions,
  PredictionFilterParams,
  PredictionRecord,
} from "@/types/prediction";
import { PredictionFormValues } from "@/validators/prediction";
import { APIResponse } from "@/types/auth";

export function usePredictions(params: PredictionFilterParams = {}) {
  return useQuery<PaginatedPredictions>({
    queryKey: ["predictions", params],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<PaginatedPredictions>>(
        "/predictions",
        { params }
      );
      return response.data.data!;
    },
  });
}

export function usePrediction(id: string) {
  return useQuery<PredictionRecord>({
    queryKey: ["prediction", id],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<PredictionRecord>>(
        `/predictions/${id}`
      );
      return response.data.data!;
    },
    enabled: !!id,
  });
}

export function useCreatePrediction() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (values: PredictionFormValues) => {
      const response = await apiClient.post<APIResponse<PredictionRecord>>(
        "/predictions",
        values
      );
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      showToast("ML Inference pipeline executed successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Prediction execution failed.";
      showToast(msg, "error");
    },
  });
}
