import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { useToast } from "@/components/ui/toast";
import { DecisionRuleRecord, PaginatedDecisionRules, RuleFilterParams } from "@/types/decision_rule";
import { RuleFormValues } from "@/validators/decision_rule";
import { APIResponse } from "@/types/auth";

export function useRules(params: RuleFilterParams = {}) {
  return useQuery<PaginatedDecisionRules>({
    queryKey: ["decision_rules", params],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<PaginatedDecisionRules>>("/rules", {
        params,
      });
      return response.data.data!;
    },
  });
}

export function useRuleDetail(id: string) {
  return useQuery<DecisionRuleRecord>({
    queryKey: ["rule_detail", id],
    queryFn: async () => {
      const response = await apiClient.get<APIResponse<DecisionRuleRecord>>(`/rules/${id}`);
      return response.data.data!;
    },
    enabled: !!id,
  });
}

export function useCreateRule() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (values: RuleFormValues) => {
      const response = await apiClient.post<APIResponse<DecisionRuleRecord>>("/rules", values);
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["decision_rules"] });
      showToast("Decision rule created successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to create decision rule.";
      showToast(msg, "error");
    },
  });
}

export function useUpdateRule() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<RuleFormValues> }) => {
      const response = await apiClient.put<APIResponse<DecisionRuleRecord>>(`/rules/${id}`, values);
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["decision_rules"] });
      queryClient.invalidateQueries({ queryKey: ["rule_detail"] });
      showToast("Decision rule updated successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to update decision rule.";
      showToast(msg, "error");
    },
  });
}

export function useDeleteRule() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/rules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decision_rules"] });
      showToast("Decision rule deleted successfully!", "info");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to delete rule.";
      showToast(msg, "error");
    },
  });
}

export function usePublishRule() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (ruleId: string) => {
      const response = await apiClient.post<APIResponse<DecisionRuleRecord>>(
        `/rules/publish?rule_id=${ruleId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decision_rules"] });
      showToast("Decision rule published successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to publish rule.";
      showToast(msg, "error");
    },
  });
}
