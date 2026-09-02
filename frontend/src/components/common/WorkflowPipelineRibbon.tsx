"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Layers,
  Cpu,
  GitPullRequest,
  Sliders,
  ShieldCheck,
  FileCheck,
  ShieldAlert,
  Network,
  Zap,
  Bell,
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

interface WorkflowStage {
  id: string;
  name: string;
  shortName: string;
  href: string;
  icon: React.ElementType;
  description: string;
}

const pipelineStages: WorkflowStage[] = [
  {
    id: "transaction",
    name: "1. Transaction Intake",
    shortName: "Transaction",
    href: "/transactions",
    icon: CreditCard,
    description: "Ingest raw event, normalize ISO 20022/Stripe payload & check idempotency lock",
  },
  {
    id: "features",
    name: "2. Feature Engineering & Store",
    shortName: "Feature Store",
    href: "/features",
    icon: Layers,
    description: "Hydrate online velocity vectors, user baselines & behavioral aggregates in <10ms",
  },
  {
    id: "models",
    name: "3. Model Registry & Selection",
    shortName: "Model Registry",
    href: "/models",
    icon: Cpu,
    description: "Select champion model artifacts, version tags & load calibration parameters",
  },
  {
    id: "orchestrator",
    name: "4. AI Orchestrator & Parallel Inference",
    shortName: "Orchestrator",
    href: "/orchestrator",
    icon: GitPullRequest,
    description: "Execute parallel inference across XGBoost, LightGBM, Autoencoder & GNN with circuit breakers",
  },
  {
    id: "rules",
    name: "5. Policy Rule Engine (AST)",
    shortName: "Rule Engine",
    href: "/rules",
    icon: Sliders,
    description: "Evaluate deterministic AST policy rules & hard blocking compliance heuristics",
  },
  {
    id: "decisions",
    name: "6. Decision Engine & Arbiter",
    shortName: "Decision Studio",
    href: "/decisions",
    icon: ShieldCheck,
    description: "Arbitrate composite risk score, compute decision recommendation & sign SHA-256 seal",
  },
  {
    id: "explanations",
    name: "7. TreeSHAP & LLM Explainability",
    shortName: "Explainability",
    href: "/explanations",
    icon: FileCheck,
    description: "Calculate sub-15ms TreeSHAP attribution & generate FCRA adverse action rationale",
  },
  {
    id: "cases",
    name: "8. Case Management & Human Review",
    shortName: "Case Workspace",
    href: "/cases",
    icon: ShieldAlert,
    description: "Create analyst investigation case, record evidence dossier & handle override decisions",
  },
  {
    id: "graph",
    name: "9. Fraud Graph Intelligence",
    shortName: "Graph Intelligence",
    href: "/graph",
    icon: Network,
    description: "Detect synthetic identities, mule rings & community clusters on interactive WebGL canvas",
  },
  {
    id: "predictions",
    name: "10. Prediction Drift & Monitoring",
    shortName: "Model Drift",
    href: "/predictions",
    icon: Zap,
    description: "Track inference telemetry, Population Stability Index (PSI) & trigger retraining",
  },
  {
    id: "notifications",
    name: "11. Alerts & Event Dispatch",
    shortName: "Notifications",
    href: "/notifications",
    icon: Bell,
    description: "Stream high-severity risk alerts to analyst channels, webhooks & PagerDuty",
  },
  {
    id: "operations",
    name: "12. Operations HUD & Telemetry",
    shortName: "Operations HUD",
    href: "/operations",
    icon: Activity,
    description: "Live cluster velocity, fraud loss prevented KPIs & chargeback ratio monitoring",
  },
];

export default function WorkflowPipelineRibbon() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(false);

  // Determine active stage index
  const activeIndex = pipelineStages.findIndex((s) => pathname.startsWith(s.href));
  const currentStage = activeIndex >= 0 ? pipelineStages[activeIndex] : null;

  return (
    <div className="bg-graphite-900/90 border border-graphite-800 rounded-2xl p-3 shadow-lg mb-6 backdrop-blur-md w-full max-w-full overflow-hidden">
      {/* Header bar with active stage summary & collapse toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-graphite-800/80 text-xs">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1 rounded-lg bg-copper-500/10 text-copper-400 border border-copper-500/20 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 min-w-0">
            <span className="font-mono text-[10px] sm:text-[11px] font-bold text-copper-400 uppercase tracking-wider truncate">
              Unified AI Decision Lifecycle:
            </span>
            <span className="text-white font-semibold text-xs truncate">
              {currentStage ? currentStage.name : "Platform Overview"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end space-x-3 text-xs shrink-0">
          {currentStage && (
            <span className="hidden md:inline-block font-mono text-[11px] text-graphite-400">
              Stage {activeIndex + 1} of {pipelineStages.length}
            </span>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-graphite-950 border border-graphite-800 hover:border-graphite-700 text-graphite-300 hover:text-white transition-colors text-[11px]"
          >
            <span>{expanded ? "Collapse Lifecycle" : "View Full Workflow"}</span>
            {expanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
          </button>
        </div>
      </div>

      {/* Horizontal Interactive Step Ribbon */}
      <div className="pt-3 overflow-x-auto custom-scrollbar w-full max-w-full">
        <div className="flex items-center space-x-1 min-w-max pb-1">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = pathname.startsWith(stage.href);
            const isCompleted = activeIndex > idx;

            return (
              <React.Fragment key={stage.id}>
                <Link
                  href={stage.href}
                  className={`group relative flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    isActive
                      ? "bg-copper-500/15 border-copper-500/40 text-copper-300 shadow-md ring-1 ring-copper-400/30 font-semibold"
                      : isCompleted
                      ? "bg-graphite-950 border-emerald-500/20 text-emerald-400 hover:border-emerald-500/40"
                      : "bg-graphite-950/60 border-graphite-800 text-graphite-400 hover:text-graphite-200 hover:border-graphite-700"
                  }`}
                  title={stage.description}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? "text-copper-400" : "text-graphite-400 group-hover:text-graphite-200"
                      }`}
                    />
                  )}
                  <span className="truncate">{stage.shortName}</span>
                </Link>

                {idx < pipelineStages.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-graphite-700 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Expanded Workflow Detail Drawer */}
      {expanded && currentStage && (
        <div className="mt-3 pt-3 border-t border-graphite-800 text-xs grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-150">
          <div className="bg-graphite-950 p-3 rounded-xl border border-graphite-800/80">
            <span className="text-[10px] font-mono uppercase text-copper-400 font-bold">Stage Objective</span>
            <p className="text-graphite-300 mt-1 leading-relaxed">{currentStage.description}</p>
          </div>

          <div className="bg-graphite-950 p-3 rounded-xl border border-graphite-800/80">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Upstream Dependencies</span>
            <p className="text-graphite-300 mt-1 leading-relaxed">
              {activeIndex > 0
                ? `Receives normalized state and context from ${pipelineStages[activeIndex - 1].shortName}`
                : "Initiates real-time ISO 20022 ingestion stream and assigns transaction UUID."}
            </p>
          </div>

          <div className="bg-graphite-950 p-3 rounded-xl border border-graphite-800/80">
            <span className="text-[10px] font-mono uppercase text-sky-400 font-bold">Downstream Consumer</span>
            <p className="text-graphite-300 mt-1 leading-relaxed">
              {activeIndex < pipelineStages.length - 1
                ? `Streams verified outputs and domain events directly to ${pipelineStages[activeIndex + 1].shortName}`
                : "Aggregates end-of-funnel executive telemetry and triggers automated model retraining."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}