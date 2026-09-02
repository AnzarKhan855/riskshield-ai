import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

export interface CopilotResponse {
  query: string;
  intent: string;
  answer: string;
  evidence: Record<string, any>;
  recommended_actions: Array<{
    label: string;
    action: string;
    target: string;
  }>;
}

export interface NLSearchResult {
  raw_query: string;
  entity_type: string;
  structured_filters: Record<string, any>;
  applied_interpretation: string;
  matched_entities_count: number;
  results: Array<Record<string, any>>;
}

export interface RootCauseResponse {
  transaction_id: string;
  composite_risk_score: number;
  decision: string;
  confidence_score: number;
  root_cause_summary: string;
  feature_deviations: Array<{
    feature: string;
    feature_key: string;
    actual_value: string;
    baseline_mean: string;
    z_score: number;
    impact: string;
    direction: string;
    contribution_pct: number;
  }>;
  triggered_rules: string[];
  mitigation_recommendation: string;
}

export interface CaseSummaryResponse {
  case_id: string;
  case_title: string;
  priority: string;
  status: string;
  category: string;
  transaction_id?: string;
  composite_risk_score: number;
  executive_summary: string;
  key_risk_factors: Array<{
    factor: string;
    severity: string;
    detail: string;
  }>;
  chronological_timeline: Array<{
    time: string;
    event: string;
  }>;
  recommended_investigator_actions: Array<{
    action: string;
    recommendation: string;
  }>;
  sar_filing_recommended: boolean;
  generated_at: string;
}

export interface FraudPatternsResponse {
  analyzed_transactions_sample: number;
  active_clusters_count: number;
  total_exposure_usd: number;
  detected_patterns: Array<{
    cluster_id: string;
    pattern_name: string;
    severity: string;
    confidence_score: number;
    affected_transactions_count: number;
    exposed_amount_usd: number;
    pattern_signature: string;
    indicators: string[];
    suggested_rule: {
      name: string;
      expression: string;
      action: string;
      estimated_precision: string;
      prevented_loss_est: string;
    };
  }>;
  discovery_timestamp: string;
}

export interface SimilarFraudResponse {
  target_transaction_id: string;
  similar_cases_count: number;
  similarity_matches: Array<{
    transaction_id: string;
    similarity_score: number;
    amount: number;
    currency: string;
    country: string;
    payment_method: string;
    status: string;
    timestamp: string;
    shared_cluster: string;
  }>;
  cluster_insights: string;
}

export interface DriftDetectionResponse {
  evaluation_timestamp: string;
  overall_psi: number;
  overall_drift_status: string;
  features_monitored_count: number;
  drifted_features_count: number;
  drifted_features: Array<any>;
  feature_drift_breakdown: Array<{
    feature: string;
    key: string;
    baseline_mean: number;
    current_mean: number;
    psi: number;
    status: string;
  }>;
  alert_thresholds: Record<string, string>;
}

export interface FeatureImportanceResponse {
  ensemble_framework: string;
  global_feature_importance: Array<{
    feature_name: string;
    feature_key: string;
    importance_score: number;
    shap_mean_abs: number;
    category: string;
  }>;
  evaluated_features_count: number;
  explanation_methodology: string;
}

export interface CounterfactualResponse {
  transaction_id: string;
  original_state: {
    risk_score: number;
    decision: string;
    features: Record<string, any>;
  };
  counterfactual_state: {
    risk_score: number;
    decision: string;
    delta_score: number;
    applied_modifications: Record<string, any>;
  };
  simulation_verdict: string;
}

export interface ScenarioTestResponse {
  scenario_type: string;
  scenario_name: string;
  description: string;
  parameters_applied: Record<string, any>;
  simulation_results: {
    baseline_approval_pct: number;
    projected_approval_pct: number;
    projected_block_pct: number;
    projected_review_pct: number;
    projected_false_positive_pct: number;
    projected_prevented_loss_usd: number;
    latency_p99_ms: number;
  };
  system_readiness: string;
  evaluated_at: string;
}

// 1. AI Copilot Hook
export function useAICopilot() {
  return useMutation({
    mutationFn: async (payload: { query: string; context?: Record<string, any> }) => {
      const resp = await apiClient.post("/ai/copilot/query", payload);
      return resp.data.data as CopilotResponse;
    },
  });
}

// 2. NL Search Hook
export function useNLSearch() {
  return useMutation({
    mutationFn: async (query: string) => {
      const resp = await apiClient.post("/ai/nl-search", { query });
      return resp.data.data as NLSearchResult;
    },
  });
}

// 3. Root Cause Analysis Hook
export function useRootCauseAnalysis(transactionId?: string) {
  return useQuery({
    queryKey: ["ai", "root-cause", transactionId],
    queryFn: async () => {
      if (!transactionId) return null;
      const resp = await apiClient.get(`/ai/root-cause/${transactionId}`);
      return resp.data.data as RootCauseResponse;
    },
    enabled: Boolean(transactionId),
  });
}

// 4. Case Summary Hook
export function useCaseSummary(caseId?: string) {
  return useQuery({
    queryKey: ["ai", "case-summary", caseId],
    queryFn: async () => {
      if (!caseId) return null;
      const resp = await apiClient.get(`/ai/case-summary/${caseId}`);
      return resp.data.data as CaseSummaryResponse;
    },
    enabled: Boolean(caseId),
  });
}

export function useGenerateCaseSummary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (caseId: string) => {
      const resp = await apiClient.post(`/ai/case-summary/${caseId}`);
      return resp.data.data as CaseSummaryResponse;
    },
    onSuccess: (data, caseId) => {
      qc.setQueryData(["ai", "case-summary", caseId], data);
    },
  });
}

// 5. Fraud Patterns Hook
export function useFraudPatterns(lookback: number = 50) {
  return useQuery({
    queryKey: ["ai", "fraud-patterns", lookback],
    queryFn: async () => {
      const resp = await apiClient.get(`/ai/fraud-patterns?lookback=${lookback}`);
      return resp.data.data as FraudPatternsResponse;
    },
  });
}

// 6. Similar Fraud Hook
export function useSimilarFraud(transactionId?: string, topK: number = 5) {
  return useQuery({
    queryKey: ["ai", "similar-fraud", transactionId, topK],
    queryFn: async () => {
      if (!transactionId) return null;
      const resp = await apiClient.get(`/ai/similar-fraud/${transactionId}?top_k=${topK}`);
      return resp.data.data as SimilarFraudResponse;
    },
    enabled: Boolean(transactionId),
  });
}

// 7. Merchant Intelligence Hook
export function useMerchantIntelligence(merchantId?: string) {
  return useQuery({
    queryKey: ["ai", "merchant-intelligence", merchantId],
    queryFn: async () => {
      if (!merchantId) return null;
      const resp = await apiClient.get(`/ai/merchant-intelligence/${merchantId}`);
      return resp.data.data;
    },
    enabled: Boolean(merchantId),
  });
}

// 8. Customer Intelligence Hook
export function useCustomerIntelligence(customerId?: string) {
  return useQuery({
    queryKey: ["ai", "customer-intelligence", customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const resp = await apiClient.get(`/ai/customer-intelligence/${customerId}`);
      return resp.data.data;
    },
    enabled: Boolean(customerId),
  });
}

// 9. Device Intelligence Hook
export function useDeviceIntelligence(deviceId?: string) {
  return useQuery({
    queryKey: ["ai", "device-intelligence", deviceId],
    queryFn: async () => {
      if (!deviceId) return null;
      const resp = await apiClient.get(`/ai/device-intelligence/${deviceId}`);
      return resp.data.data;
    },
    enabled: Boolean(deviceId),
  });
}

// 10. Risk Recommendations Hook
export function useRiskRecommendations() {
  return useQuery({
    queryKey: ["ai", "risk-recommendations"],
    queryFn: async () => {
      const resp = await apiClient.get("/ai/risk-recommendations");
      return resp.data.data;
    },
  });
}

// 11. Rule Suggestions Hook
export function useRuleSuggestions() {
  return useQuery({
    queryKey: ["ai", "rule-suggestions"],
    queryFn: async () => {
      const resp = await apiClient.get("/ai/rule-suggestions");
      return resp.data.data;
    },
  });
}

// 12. Model Recommendations Hook
export function useModelRecommendations() {
  return useQuery({
    queryKey: ["ai", "model-recommendations"],
    queryFn: async () => {
      const resp = await apiClient.get("/ai/model-recommendations");
      return resp.data.data;
    },
  });
}

// 13. Drift Detection Hook
export function useDriftDetection() {
  return useQuery({
    queryKey: ["ai", "drift-detection"],
    queryFn: async () => {
      const resp = await apiClient.get("/ai/drift-detection");
      return resp.data.data as DriftDetectionResponse;
    },
  });
}

// 14. Feature Importance Hook
export function useFeatureImportance() {
  return useQuery({
    queryKey: ["ai", "feature-importance"],
    queryFn: async () => {
      const resp = await apiClient.get("/ai/feature-importance");
      return resp.data.data as FeatureImportanceResponse;
    },
  });
}

// 15. Counterfactual Simulation Hook
export function useCounterfactualSimulation() {
  return useMutation({
    mutationFn: async (payload: { transaction_id: string; modifications: Record<string, any> }) => {
      const resp = await apiClient.post("/ai/counterfactual", payload);
      return resp.data.data as CounterfactualResponse;
    },
  });
}

// 16. Scenario Testing Hook
export function useScenarioTesting() {
  return useMutation({
    mutationFn: async (payload: { scenario_type: string; parameters?: Record<string, any> }) => {
      const resp = await apiClient.post("/ai/scenario-testing", payload);
      return resp.data.data as ScenarioTestResponse;
    },
  });
}
