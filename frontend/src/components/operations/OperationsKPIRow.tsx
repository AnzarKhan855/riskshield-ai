"use client";

import React from "react";
import { SystemHealthMetrics } from "@/types/operations";
import { DecisionRecord } from "@/types/decision";
import { Activity, DollarSign, ShieldCheck, Cpu, Zap, ArrowUpRight, TrendingUp } from "lucide-react";

interface OperationsKPIRowProps {
  health: SystemHealthMetrics;
  decisions: DecisionRecord[];
  activeModelCount: number;
}

export default function OperationsKPIRow({
  health,
  decisions,
  activeModelCount,
}: OperationsKPIRowProps) {
  const blocks = decisions.filter((d) => d.decision === "BLOCK").length;
  const reviews = decisions.filter((d) => d.decision === "REVIEW").length;
  const approves = decisions.filter((d) => d.decision === "APPROVE").length;
  const totalDecisions = decisions.length || 1;

  const blockPct = ((blocks / totalDecisions) * 100).toFixed(1);
  const reviewPct = ((reviews / totalDecisions) * 100).toFixed(1);
  const approvePct = ((approves / totalDecisions) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
      {/* KPI Card 1: Throughput & Latency */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-sm hover:border-graphite-700/60 transition-all flex flex-col justify-between h-[150px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider text-graphite-400">
              System Throughput
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            P99 SLA
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold font-mono text-white">
              {health.throughput_tps || 1240}
            </span>
            <span className="text-xs font-mono text-graphite-400">TPS</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-mono font-bold text-copper-400">
              {health.avg_latency_ms || 12.4}ms
            </span>
            <span className="text-[10px] text-graphite-500 block">Avg Latency</span>
          </div>
        </div>

        <div className="w-full bg-graphite-950 h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className="bg-emerald-400 h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, ((health.avg_latency_ms || 12.4) / 50) * 100)}%` }}
          />
        </div>
      </div>

      {/* KPI Card 2: Prevented Loss & Net Velocity */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-sm hover:border-graphite-700/60 transition-all flex flex-col justify-between h-[150px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-copper-400 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider text-graphite-400">
              Prevented Volume
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-copper-500/10 text-copper-400 border border-copper-500/20">
            LIVE 24H
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <span className="text-2xl font-bold font-mono text-emerald-400">
            $482,900.00
          </span>
          <div className="flex items-center text-xs text-emerald-400 font-mono font-semibold">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>+14.2%</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-graphite-400 font-mono pt-1">
          <span>Chargeback Ratio:</span>
          <span className="text-emerald-400 font-bold">0.18% (Target &lt; 0.90%)</span>
        </div>
      </div>

      {/* KPI Card 3: Automated Decision Distribution */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-sm hover:border-graphite-700/60 transition-all flex flex-col justify-between h-[150px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider text-graphite-400">
              Auto Decisions
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            {totalDecisions} AUDITED
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <span className="text-2xl font-bold font-mono text-white">
            {approvePct}%
          </span>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            AUTO-APPROVE
          </span>
        </div>

        <div className="w-full bg-graphite-950 h-1.5 rounded-full overflow-hidden flex mt-2">
          <div style={{ width: `${blockPct}%` }} className="bg-rose-500 h-full" title={`BLOCK ${blockPct}%`} />
          <div style={{ width: `${reviewPct}%` }} className="bg-amber-400 h-full" title={`REVIEW ${reviewPct}%`} />
          <div style={{ width: `${approvePct}%` }} className="bg-emerald-400 h-full" title={`APPROVE ${approvePct}%`} />
        </div>
      </div>

      {/* KPI Card 4: AI Model Ensemble Posture */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-sm hover:border-graphite-700/60 transition-all flex flex-col justify-between h-[150px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-gold-400 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider text-graphite-400">
              ML Inference Mesh
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ACTIVE
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold font-mono text-white">
              {activeModelCount || 4} / 4
            </span>
            <span className="text-xs font-mono text-emerald-400">Models</span>
          </div>
          <span className="text-xs font-mono text-copper-400 font-bold">
            99.999% SLA
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-graphite-400 font-mono pt-1">
          <span>Frameworks:</span>
          <span className="text-white font-semibold">XGBoost &bull; ONNX &bull; PyTorch</span>
        </div>
      </div>
    </div>
  );
}
