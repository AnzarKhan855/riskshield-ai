export interface InvestigationCaseRecord {
  id: string;
  case_id: string;
  decision_id?: string;
  transaction_id: string;
  merchant_id?: string;
  customer_id?: string;
  assigned_analyst_id?: string;
  assigned_analyst_name?: string;

  priority: string; // LOW, MEDIUM, HIGH, CRITICAL
  status: string; // OPEN, ASSIGNED, UNDER_INVESTIGATION, PENDING_REVIEW, RESOLVED, CLOSED
  category: string; // Fraud, Chargeback, AML, Compliance, Identity, Merchant Abuse, Promotion Abuse
  severity: string;

  case_title: string;
  case_description?: string;
  resolution?: string; // APPROVE, REJECT, ESCALATE, CLOSE
  resolution_notes?: string;

  opened_at: string;
  assigned_at?: string;
  resolved_at?: string;
  closed_at?: string;

  case_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface EvidenceRecord {
  id: string;
  evidence_id: string;
  case_id: string;
  evidence_type: string;
  title: string;
  description?: string;
  reference_id?: string;
  metadata_json: Record<string, any>;
  created_by: string;
  created_at: string;
}

export interface CommentRecord {
  id: string;
  comment_id: string;
  case_id: string;
  author_id: string;
  author_name: string;
  comment: string;
  created_at: string;
}

export interface TimelineRecord {
  id: string;
  timeline_id: string;
  case_id: string;
  action: string;
  actor: string;
  details: Record<string, any>;
  created_at: string;
}

export interface CaseWorkspaceData {
  case_details: InvestigationCaseRecord;
  evidence_list: EvidenceRecord[];
  comments_list: CommentRecord[];
  timeline_list: TimelineRecord[];
  decision_summary?: {
    decision_id: string;
    decision: string;
    composite_risk_score: number;
    confidence: number;
    reason: string;
  };
  transaction_summary?: {
    transaction_id: string;
    amount: number;
    currency: string;
    payment_method: string;
    card_network: string;
    status: string;
    country: string;
  };
}

export interface PaginatedCases {
  items: InvestigationCaseRecord[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CaseFilterParams {
  search?: string;
  priority?: string;
  status?: string;
  category?: string;
  analyst_id?: string;
  page?: number;
  size?: number;
  sort_by?: string;
  sort_dir?: string;
}
