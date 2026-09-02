"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import OrchestratorForm from "@/components/orchestrator/OrchestratorForm";
import OrchestratorTable from "@/components/orchestrator/OrchestratorTable";
import { useOrchestrations, useOrchestratePredict } from "@/hooks/useOrchestrator";
import { OrchestratorFormValues } from "@/validators/orchestrator";
import { Cpu, Layers, Activity, Clock } from "lucide-react";
import Link from "next/link";

export default function OrchestratorWorkbenchPage() {
  const { data, isLoading } = useOrchestrations({ page: 1, size: 5 });
  const orchestrateMutation = useOrchestratePredict();

  const handleExecute = (values: OrchestratorFormValues) => {
    orchestrateMutation.mutate(values);
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 w-full">
            <div className="min-w-0">
              <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400 mb-1">
                <Cpu className="w-4 h-4 text-copper-400 shrink-0" />
                <span className="truncate">Enterprise AI Orchestration Platform</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                Developer Orchestrator Workbench
              </h1>
              <p className="text-xs text-graphite-400 mt-1">
                Coordinate and execute multi-model AI predictions in parallel across Fraud, Risk, Device, and Behaviour domains.
              </p>
            </div>

            <Link
              href="/orchestrator/history"
              className="px-4 py-2.5 bg-graphite-900 border border-graphite-700 hover:bg-graphite-800 text-copper-400 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-2 shrink-0"
            >
              <Clock className="w-4 h-4" />
              <span>View Full History Logs</span>
            </Link>
          </div>

          {/* Workbench Trigger Form */}
          <div className="mb-8">
            <OrchestratorForm onSubmit={handleExecute} isLoading={orchestrateMutation.isPending} />
          </div>

          {/* Recent Orchestration Executions */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-copper-400" />
              <span>Recent Orchestration Executions</span>
            </h2>
            <OrchestratorTable predictions={data?.items || []} isLoading={isLoading} />
          </div>
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
