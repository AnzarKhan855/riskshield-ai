export interface SystemHealthMetrics {
  status: "OPERATIONAL" | "DEGRADED" | "OUTAGE";
  uptime_percentage: number;
  active_models_count: number;
  avg_latency_ms: number;
  throughput_tps: number;
}

export interface OperationalSummary {
  system_health: SystemHealthMetrics;
  total_transactions_24h: number;
  total_blocked_24h: number;
  total_cases_open: number;
  high_risk_merchants_count: number;
}

export interface OperationsFilterParams {
  refresh_interval_ms?: number;
  workspace?: string;
}
