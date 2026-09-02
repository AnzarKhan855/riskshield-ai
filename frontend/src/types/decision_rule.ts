export interface DecisionRuleRecord {
  id: string;
  rule_id: string;
  rule_name: string;
  rule_category: string;
  priority: number;
  version: string;
  status: string; // DRAFT, PUBLISHED, ARCHIVED
  description?: string;
  expression: string;
  action: string; // APPROVE, REVIEW, BLOCK, ESCALATE
  severity: string; // LOW, MEDIUM, HIGH, CRITICAL
  enabled: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedDecisionRules {
  items: DecisionRuleRecord[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface RuleFilterParams {
  search?: string;
  rule_category?: string;
  status?: string;
  enabled?: boolean;
  page?: number;
  size?: number;
  sort_by?: string;
  sort_dir?: string;
}
