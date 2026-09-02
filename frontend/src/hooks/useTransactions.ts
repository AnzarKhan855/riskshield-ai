import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { useToast } from "@/components/ui/toast";
import {
  PaginatedTransactions,
  Transaction,
  TransactionFilterParams,
} from "@/types/transaction";
import { TransactionFormData } from "@/validators/transaction";
import { APIResponse } from "@/types/auth";

export function useTransactions(params: TransactionFilterParams = {}) {
  return useQuery<PaginatedTransactions>({
    queryKey: ["transactions", params],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<PaginatedTransactions>>(
        "/transactions",
        { params }
      );
      return response.data.data!;
    },
  });
}

export function useTransaction(id: string) {
  return useQuery<Transaction>({
    queryKey: ["transaction", id],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<Transaction>>(
        `/transactions/${id}`
      );
      return response.data.data!;
    },
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const response = await apiClient.post<APIResponse<Transaction>>(
        "/transactions",
        data
      );
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      showToast("Transaction created successfully!", "success");
      router.push(`/transactions/${res.data?.id}`);
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || "Failed to create transaction.";
      showToast(msg, "error");
    },
  });
}

export function useUpdateTransaction(id: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<TransactionFormData>) => {
      const response = await apiClient.put<APIResponse<Transaction>>(
        `/transactions/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaction", id] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      showToast("Transaction updated successfully!", "success");
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || "Failed to update transaction.";
      showToast(msg, "error");
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      showToast("Transaction soft-deleted successfully", "info");
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || "Failed to delete transaction.";
      showToast(msg, "error");
    },
  });
}
