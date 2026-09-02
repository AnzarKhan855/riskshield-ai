export type DecisionAction = "APPROVE" | "REVIEW" | "BLOCK" | "ESCALATE";

export interface TriggeredRuleInfo {
  rule_id: string;
  rule_name: string;
  category: string;
  action: DecisionAction;
  severity: string;
  priority: number;
}

export interface DecisionRecord {
  id: string;
  decision_id: string;
  composite_prediction_id?: string;
  transaction_id: string;
  merchant_id?: string;
  customer_id?: string;

  decision: DecisionAction;
  decision_status: string;
  decision_confidence: number;
  composite_risk_score: number;
  decision_reason: string;

  triggered_rules: TriggeredRuleInfo[];
  triggered_policies: string[];
  execution_time_ms: number;

  decision_source: string;
  reviewer_id?: string;
  review_status: string; // NONE, PENDING_REVIEW, APPROVED_OVERRIDE, REJECTED_OVERRIDE

  decision_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaginatedDecisions {
  items: DecisionRecord[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface DecisionFilterParams {
  transaction_id?: string;
  decision?: string;
  review_status?: string;
  page?: number;
  size?: number;
  sort_by?: string;
  sort_dir?: string;
}
