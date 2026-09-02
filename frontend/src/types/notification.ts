export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type EventType =
  | "TRANSACTION_CREATED"
  | "TRANSACTION_FAILED"
  | "HIGH_RISK_TRANSACTION"
  | "DECISION_GENERATED"
  | "MODEL_PREDICTION"
  | "CASE_CREATED"
  | "CASE_ASSIGNED"
  | "CASE_CLOSED"
  | "RULE_PUBLISHED"
  | "MERCHANT_CREATED"
  | "DEVICE_FLAGGED"
  | "CUSTOMER_FLAGGED";

export interface NotificationRecord {
  id: string;
  notification_id: string;
  user_id: string;
  title: string;
  message: string;
  type: EventType;
  priority: NotificationPriority;
  is_read: boolean;
  read_at?: string;
  payload: Record<string, any>;
  created_at: string;
}

export interface PaginatedNotifications {
  items: NotificationRecord[];
  unread_count: number;
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface EventLogRecord {
  id: string;
  event_id: string;
  event_type: EventType;
  source: string;
  payload: Record<string, any>;
  created_at: string;
}

export interface PaginatedEventLogs {
  items: EventLogRecord[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface NotificationFilterParams {
  is_read?: boolean;
  search?: string;
  page?: number;
  size?: number;
}
