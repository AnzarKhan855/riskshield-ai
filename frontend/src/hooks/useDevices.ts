import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { useToast } from "@/components/ui/toast";
import { Device, DeviceFilterParams, PaginatedDevices } from "@/types/device";
import { Transaction } from "@/types/transaction";
import { DeviceFormData } from "@/validators/device";
import { APIResponse } from "@/types/auth";

export function useDevices(params: DeviceFilterParams = {}) {
  return useQuery<PaginatedDevices>({
    queryKey: ["devices", params],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<PaginatedDevices>>(
        "/devices",
        { params }
      );
      return response.data.data!;
    },
  });
}

export function useDevice(id: string) {
  return useQuery<Device>({
    queryKey: ["device", id],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<Device>>(
        `/devices/${id}`
      );
      return response.data.data!;
    },
    enabled: !!id,
  });
}

export function useDeviceTimeline(id: string) {
  return useQuery<Transaction[]>({
    queryKey: ["device_timeline", id],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<Transaction[]>>(
        `/devices/${id}/transactions`
      );
      return response.data.data!;
    },
    enabled: !!id,
  });
}

export function useCreateDevice() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: DeviceFormData) => {
      const response = await apiClient.post<APIResponse<Device>>(
        "/devices",
        data
      );
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      showToast("Device profile registered successfully!", "success");
      router.push(`/devices/${res.data?.id}`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to register device.";
      showToast(msg, "error");
    },
  });
}

export function useUpdateDevice(id: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<DeviceFormData>) => {
      const response = await apiClient.put<APIResponse<Device>>(
        `/devices/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["device", id] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      showToast("Device updated successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to update device.";
      showToast(msg, "error");
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/devices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      showToast("Device profile soft-deleted successfully", "info");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to delete device.";
      showToast(msg, "error");
    },
  });
}
