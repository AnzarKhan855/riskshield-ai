import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { useToast } from "@/components/ui/toast";
import {
  CaseFilterParams,
  CaseWorkspaceData,
  CommentRecord,
  EvidenceRecord,
  InvestigationCaseRecord,
  PaginatedCases,
} from "@/types/investigation";
import { CaseFormValues, CaseResolveValues, CaseCommentValues } from "@/validators/investigation";
import { APIResponse } from "@/types/auth";

export function useCases(params: CaseFilterParams = {}) {
  return useQuery<PaginatedCases>({
    queryKey: ["cases", params],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<PaginatedCases>>("/cases", {
        params,
      });
      return response.data.data!;
    },
  });
}

export function useCaseWorkspace(id: string) {
  return useQuery<CaseWorkspaceData>({
    queryKey: ["case_workspace", id],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<CaseWorkspaceData>>(`/cases/${id}`);
      return response.data.data!;
    },
    enabled: !!id,
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (values: CaseFormValues) => {
      const response = await apiClient.post<APIResponse<InvestigationCaseRecord>>("/cases", values);
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      showToast("Investigation case created successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to create investigation case.";
      showToast(msg, "error");
    },
  });
}

export function useAssignCase() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, analystId, analystName }: { id: string; analystId: string; analystName: string }) => {
      const response = await apiClient.post<APIResponse<InvestigationCaseRecord>>(`/cases/${id}/assign`, {
        analyst_id: analystId,
        analyst_name: analystName,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["case_workspace"] });
      showToast("Analyst assigned successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to assign case.";
      showToast(msg, "error");
    },
  });
}

export function useResolveCase() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: CaseResolveValues }) => {
      const response = await apiClient.post<APIResponse<InvestigationCaseRecord>>(`/cases/${id}/resolve`, values);
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["case_workspace"] });
      showToast(`Case resolution recorded: ${res.data?.resolution}!`, "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to resolve case.";
      showToast(msg, "error");
    },
  });
}

export function useCloseCase() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<APIResponse<InvestigationCaseRecord>>(`/cases/${id}/close`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["case_workspace"] });
      showToast("Case marked as CLOSED.", "info");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to close case.";
      showToast(msg, "error");
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: CaseCommentValues }) => {
      const response = await apiClient.post<APIResponse<CommentRecord>>(`/cases/${id}/comments`, values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case_workspace"] });
      showToast("Analyst note added!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to add comment.";
      showToast(msg, "error");
    },
  });
}
