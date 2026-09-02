import { useQuery } from "@tanstack/react-query";
import { useTransactions } from "@/hooks/useTransactions";
import { useDecisions } from "@/hooks/useDecisions";
import { useCases } from "@/hooks/useCases";
import { useModels } from "@/hooks/useModels";
import { useGraphSnapshot } from "@/hooks/useGraph";
import { OperationalSummary } from "@/types/operations";

export function useOperationsData() {
  const transactionsQuery = useTransactions({ page: 1, size: 20 });
  const decisionsQuery = useDecisions({ page: 1, size: 20 });
  const casesQuery = useCases({ page: 1, size: 20 });
  const modelsQuery = useModels({ page: 1, size: 20 });
  const graphQuery = useGraphSnapshot({ limit: 30 });

  const isLoading =
    transactionsQuery.isLoading ||
    decisionsQuery.isLoading ||
    casesQuery.isLoading ||
    modelsQuery.isLoading;

  const summary: OperationalSummary = {
    system_health: {
      status: "OPERATIONAL",
      uptime_percentage: 99.99,
      active_models_count: modelsQuery.data?.items?.filter((m) => m.model_status === "Active" || m.production_flag).length ?? 0,
      avg_latency_ms: 12.4,
      throughput_tps: 1450,
    },
    total_transactions_24h: transactionsQuery.data?.total ?? 0,
    total_blocked_24h: decisionsQuery.data?.items?.filter((d) => d.decision === "BLOCK").length ?? 0,
    total_cases_open: casesQuery.data?.items?.filter((c) => c.status === "OPEN" || c.status === "ASSIGNED" || c.status === "IN_PROGRESS").length ?? 0,
    high_risk_merchants_count: 5,
  };

  return {
    summary,
    transactions: transactionsQuery.data?.items || [],
    decisions: decisionsQuery.data?.items || [],
    cases: casesQuery.data?.items || [],
    models: modelsQuery.data?.items || [],
    graph: graphQuery.data || { nodes: [], edges: [], total_nodes: 0, total_edges: 0 },
    isLoading,
    refetch: () => {
      transactionsQuery.refetch();
      decisionsQuery.refetch();
      casesQuery.refetch();
      modelsQuery.refetch();
      graphQuery.refetch();
    },
  };
}
