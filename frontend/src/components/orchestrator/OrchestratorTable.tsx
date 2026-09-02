"use client";

import React from "react";
import Link from "next/link";
import { Eye, Cpu, ShieldAlert, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { CompositePredictionRecord } from "@/types/orchestrator";
import { cn } from "@/lib/utils";

interface OrchestratorTableProps {
  predictions: CompositePredictionRecord[];
  isLoading: boolean;
}

export default function OrchestratorTable({
  predictions,
  isLoading,
}: OrchestratorTableProps) {
  if (isLoading) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-graphite-800/50 rounded-lg w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-graphite-800 text-copper-400 flex items-center justify-center mx-auto">
          <Cpu className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Orchestrated Predictions Found</h3>
        <p className="text-xs text-graphite-400 max-w-sm mx-auto">
          No multi-model AI orchestrations have been executed yet. Trigger a prediction pipeline request to view execution traces.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-graphite-300">
          <thead className="bg-graphite-950/80 uppercase tracking-wider text-[10px] font-semibold text-copper-400 border-b border-graphite-800">
            <tr>
              <th className="px-6 py-4">Prediction ID & Txn</th>
              <th className="px-6 py-4">Risk Level</th>
              <th className="px-6 py-4">Composite Score</th>
              <th className="px-6 py-4">Executed Models</th>
              <th className="px-6 py-4">Orchestration Latency</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-graphite-800/60">
            {predictions.map((p) => {
              const lvl = p.composite_risk_level.toUpperCase();
              return (
                <tr key={p.id} className="hover:bg-graphite-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-sm font-semibold text-copper-400">
                        {p.prediction_id}
                      </span>
                      <span className="text-[11px] font-mono text-graphite-400">
                        Txn: {p.transaction_id}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border",
                        lvl === "CRITICAL"
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          : lvl === "HIGH"
                          ? "bg-rose-400/10 border-rose-400/30 text-rose-300"
                          : lvl === "MEDIUM"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      )}
                    >
                      {lvl}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-mono font-extrabold text-white text-sm">
                    {p.overall_risk_score.toFixed(1)} / 100
                  </td>

                  <td className="px-6 py-4 font-mono text-xs text-graphite-300">
                    <span className="px-2 py-0.5 rounded bg-graphite-800 text-copper-400 font-semibold">
                      {p.executed_models?.length || 0} Models
                    </span>
                  </td>

                  <td className="px-6 py-4 font-mono text-xs text-sky-400">
                    {p.execution_time_ms} ms
                  </td>

                  <td className="px-6 py-4 text-graphite-400 text-[11px]">
                    {new Date(p.created_at).toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/orchestrator/history/${p.prediction_id}`}
                      className="p-1.5 rounded-lg bg-graphite-800 hover:bg-graphite-700 text-graphite-300 hover:text-copper-400 transition-colors inline-block"
                      title="Inspect Execution Trace"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
