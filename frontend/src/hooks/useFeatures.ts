import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { useToast } from "@/components/ui/toast";
import {
  FeatureFilterParams,
  FeatureStoreRecord,
  PaginatedFeatureStore,
} from "@/types/feature";
import { APIResponse } from "@/types/auth";

export function useFeatures(params: FeatureFilterParams = {}) {
  return useQuery<PaginatedFeatureStore>({
    queryKey: ["features_history", params],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<PaginatedFeatureStore>>(
        "/features/history",
        { params }
      );
      return response.data.data!;
    },
  });
}

export function useFeatureVector(transaction_id: string) {
  return useQuery<FeatureStoreRecord>({
    queryKey: ["feature_vector", transaction_id],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<FeatureStoreRecord>>(
        `/features/${transaction_id}`
      );
      return response.data.data!;
    },
    enabled: !!transaction_id,
  });
}

export function useGenerateFeatures() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (transaction_id: string) => {
      const response = await apiClient.post<APIResponse<FeatureStoreRecord>>(
        "/features/generate",
        { transaction_id }
      );
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["features_history"] });
      showToast("Feature vector generated successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to generate feature vector.";
      showToast(msg, "error");
    },
  });
}

export function useRecomputeFeatures() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (transaction_id: string) => {
      const response = await apiClient.post<APIResponse<FeatureStoreRecord>>(
        "/features/recompute",
        { transaction_id }
      );
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["feature_vector", res.data?.transaction_id] });
      queryClient.invalidateQueries({ queryKey: ["features_history"] });
      showToast("Feature vector recomputed successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to recompute feature vector.";
      showToast(msg, "error");
    },
  });
}
