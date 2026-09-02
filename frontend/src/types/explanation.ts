export interface FeatureContributionRecord {
  feature_name: string;
  feature_value: any;
  importance_score: number;
  shap_value: number;
  direction: "INCREASES_RISK" | "DECREASES_RISK" | "NEUTRAL";
  description: string;
}

export interface ModelContributionRecord {
  model_id: string;
  model_name: string;
  model_type: string;
  weight: number;
  risk_score: number;
  contribution_score: number;
  status: string;
}

export interface BusinessRuleContributionRecord {
  rule_id: string;
  rule_name: string;
  rule_category: string;
  severity: string;
  action: string;
  impact_score: number;
  description: string;
}

export interface RecommendationRecord {
  action_type: string;
  title: string;
  rationale: string;
  priority: string;
  metadata: Record<string, any>;
}

export interface ExplanationRecord {
  id: string;
  explanation_id: string;
  decision_id: string;
  transaction_id: string;
  merchant_id?: string;
  customer_id?: string;
  composite_risk_score: number;
  confidence_score: number;
  primary_reason: string;
  feature_contributions: FeatureContributionRecord[];
  model_contributions: ModelContributionRecord[];
  rule_contributions: BusinessRuleContributionRecord[];
  recommendations: RecommendationRecord[];
  audit_info: {
    audit_hash: string;
    engine_version: string;
    compliance_standard: string;
    audited_at: string;
    verifiable: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface PaginatedExplanations {
  items: ExplanationRecord[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ExplanationFilterParams {
  search?: string;
  page?: number;
  size?: number;
}
