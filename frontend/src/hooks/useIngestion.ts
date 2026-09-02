import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { useToast } from "@/components/ui/toast";
import {
  DemoIngestRequest,
  DemoIngestResponse,
  FileParseResponse,
  BatchIngestRequest,
  BatchIngestResponse,
  PaginatedImportHistoryResponse,
} from "@/types/ingestion";
import { APIResponse } from "@/types/auth";

export function useLoadDemoDataset() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (payload: DemoIngestRequest) => {
      const response = await apiClient.post<APIResponse<DemoIngestResponse>>(
        "/ingestion/demo",
        payload
      );
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["operations-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
      queryClient.invalidateQueries({ queryKey: ["graph-snapshot"] });
      queryClient.invalidateQueries({ queryKey: ["ingestion-history"] });
      showToast("Enterprise demo dataset loaded and processed successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to load demo dataset.";
      showToast(msg, "error");
    },
  });
}

export function useUploadDatasetFile() {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post<APIResponse<FileParseResponse>>(
        "/ingestion/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      showToast("Dataset parsed and validated successfully.", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to parse uploaded dataset.";
      showToast(msg, "error");
    },
  });
}

export function useExecuteBatchImport() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (payload: BatchIngestRequest) => {
      const response = await apiClient.post<APIResponse<BatchIngestResponse>>(
        "/ingestion/execute",
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["operations-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["ingestion-history"] });
      showToast("Batch import pipeline executed successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Batch import pipeline failed.";
      showToast(msg, "error");
    },
  });
}

export function useImportHistory(page: number = 1, size: number = 10) {
  return useQuery<PaginatedImportHistoryResponse>({
    queryKey: ["ingestion-history", page, size],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<PaginatedImportHistoryResponse>>(
        "/ingestion/history",
        { params: { page, size } }
      );
      return response.data.data!;
    },
  });
}

export function useRollbackImport() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (importId: string) => {
      const response = await apiClient.post<APIResponse<any>>(
        `/ingestion/rollback/${importId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingestion-history"] });
      showToast("Import batch rolled back successfully.", "info");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to rollback import batch.";
      showToast(msg, "error");
    },
  });
}
