"use client";

import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import CommandBar from "@/components/operations/CommandBar";
import OperationsKPIRow from "@/components/operations/OperationsKPIRow";
import LiveTransactionCard from "@/components/operations/LiveTransactionCard";
import DecisionIntelligenceCard from "@/components/operations/DecisionIntelligenceCard";
import RiskDistributionCard from "@/components/operations/RiskDistributionCard";
import InvestigationQueueCard from "@/components/operations/InvestigationQueueCard";
import AIModelsStatusCard from "@/components/operations/AIModelsStatusCard";
import GeoRiskHeatmapCard from "@/components/operations/GeoRiskHeatmapCard";
import AuditTimelineCard from "@/components/operations/AuditTimelineCard";
import { useOperationsData } from "@/hooks/useOperations";

export default function RiskOperationsCenterPage() {
  const { summary, transactions, decisions, cases, models, isLoading, refetch } =
    useOperationsData();

  const activeModelCount = models.filter((m) => m.model_status === "Active").length || 4;

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-8 w-full">
          {/* Top Operational Command Bar */}
          <CommandBar onRefresh={refetch} isLoading={isLoading} />

          {/* Section 1: Standardized KPI Metrics Row (4-Column Grid, h-[150px]) */}
          <OperationsKPIRow
            health={summary.system_health}
            decisions={decisions}
            activeModelCount={activeModelCount}
          />

          {/* Section 2: Real-Time Live Activity & Decision Outcomes (2-Column Balanced Grid, h-[440px]) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <LiveTransactionCard transactions={transactions} />
            <DecisionIntelligenceCard decisions={decisions} />
          </div>

          {/* Section 3: Risk Governance & Active Investigation Operations (2-Column Balanced Grid, h-[440px]) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <RiskDistributionCard decisions={decisions} />
            <InvestigationQueueCard cases={cases} />
          </div>

          {/* Section 4: Machine Learning Posture, Geo Telemetry & Audit Timeline (3-Column Balanced Grid, h-[420px]) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
            <AIModelsStatusCard models={models} />
            <GeoRiskHeatmapCard />
            <AuditTimelineCard />
          </div>
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
