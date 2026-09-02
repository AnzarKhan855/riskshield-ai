import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { useToast } from "@/components/ui/toast";
import {
  Merchant,
  MerchantFilterParams,
  PaginatedMerchants,
} from "@/types/merchant";
import { MerchantFormData } from "@/validators/merchant";
import { APIResponse } from "@/types/auth";

export function useMerchants(params: MerchantFilterParams = {}) {
  return useQuery<PaginatedMerchants>({
    queryKey: ["merchants", params],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<PaginatedMerchants>>(
        "/merchants",
        { params }
      );
      return response.data.data!;
    },
  });
}

export function useMerchant(id: string) {
  return useQuery<Merchant>({
    queryKey: ["merchant", id],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<Merchant>>(
        `/merchants/${id}`
      );
      return response.data.data!;
    },
    enabled: !!id,
  });
}

export function useCreateMerchant() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: MerchantFormData) => {
      const response = await apiClient.post<APIResponse<Merchant>>(
        "/merchants",
        data
      );
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      showToast("Merchant registered successfully!", "success");
      router.push(`/merchants/${res.data?.id}`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to create merchant.";
      showToast(msg, "error");
    },
  });
}

export function useUpdateMerchant(id: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<MerchantFormData>) => {
      const response = await apiClient.put<APIResponse<Merchant>>(
        `/merchants/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant", id] });
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      showToast("Merchant details updated successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to update merchant.";
      showToast(msg, "error");
    },
  });
}

export function useDeleteMerchant() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/merchants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      showToast("Merchant soft deleted successfully", "info");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to delete merchant.";
      showToast(msg, "error");
    },
  });
}
