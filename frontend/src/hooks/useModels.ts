import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { useToast } from "@/components/ui/toast";
import {
  ModelFilterParams,
  ModelRegistryRecord,
  PaginatedModelRegistry,
} from "@/types/model_registry";
import { ModelRegisterFormValues } from "@/validators/model_registry";
import { APIResponse } from "@/types/auth";

export function useModels(params: ModelFilterParams = {}) {
  return useQuery<PaginatedModelRegistry>({
    queryKey: ["models", params],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<PaginatedModelRegistry>>(
        "/models",
        { params }
      );
      return response.data.data!;
    },
  });
}

export function useModel(id: string) {
  return useQuery<ModelRegistryRecord>({
    queryKey: ["model", id],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<ModelRegistryRecord>>(
        `/models/${id}`
      );
      return response.data.data!;
    },
    enabled: !!id,
  });
}

export function useRegisterModel() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (values: ModelRegisterFormValues) => {
      const response = await apiClient.post<APIResponse<ModelRegistryRecord>>(
        "/models/register",
        values
      );
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      showToast("Model registered successfully in ModelRegistry!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to register model.";
      showToast(msg, "error");
    },
  });
}

export function usePromoteModel() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (model_id: string) => {
      const response = await apiClient.post<APIResponse<ModelRegistryRecord>>(
        "/models/promote",
        { model_id }
      );
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      queryClient.invalidateQueries({ queryKey: ["model", res.data?.model_id] });
      showToast("Model promoted to Production successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to promote model to production.";
      showToast(msg, "error");
    },
  });
}

export function useRollbackModel() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ model_type, target_version }: { model_type: string; target_version: string }) => {
      const response = await apiClient.post<APIResponse<ModelRegistryRecord>>(
        "/models/rollback",
        { model_type, target_version }
      );
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      showToast("Production model rolled back successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to rollback production model.";
      showToast(msg, "error");
    },
  });
}
