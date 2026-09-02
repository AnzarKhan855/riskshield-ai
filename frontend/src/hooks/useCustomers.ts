import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { useToast } from "@/components/ui/toast";
import { Customer, CustomerFilterParams, PaginatedCustomers } from "@/types/customer";
import { Transaction } from "@/types/transaction";
import { CustomerFormData } from "@/validators/customer";
import { APIResponse } from "@/types/auth";

export function useCustomers(params: CustomerFilterParams = {}) {
  return useQuery<PaginatedCustomers>({
    queryKey: ["customers", params],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<PaginatedCustomers>>(
        "/customers",
        { params }
      );
      return response.data.data!;
    },
  });
}

export function useCustomer(id: string) {
  return useQuery<Customer>({
    queryKey: ["customer", id],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<Customer>>(
        `/customers/${id}`
      );
      return response.data.data!;
    },
    enabled: !!id,
  });
}

export function useCustomerTimeline(id: string) {
  return useQuery<Transaction[]>({
    queryKey: ["customer_timeline", id],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<Transaction[]>>(
        `/customers/${id}/transactions`
      );
      return response.data.data!;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const response = await apiClient.post<APIResponse<Customer>>(
        "/customers",
        data
      );
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      showToast("Customer profile created successfully!", "success");
      router.push(`/customers/${res.data?.id}`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to create customer.";
      showToast(msg, "error");
    },
  });
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<CustomerFormData>) => {
      const response = await apiClient.put<APIResponse<Customer>>(
        `/customers/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      showToast("Customer updated successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to update customer.";
      showToast(msg, "error");
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      showToast("Customer soft-deleted successfully", "info");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to delete customer.";
      showToast(msg, "error");
    },
  });
}
