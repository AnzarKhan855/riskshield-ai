"use client";

import React from "react";
import { IndividualModelResult } from "@/types/orchestrator";
import { Clock, Cpu, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutionTimelineGraphProps {
  individualResults: Record<string, IndividualModelResult>;
  totalLatencyMs: number;
}

export default function ExecutionTimelineGraph({
  individualResults,
  totalLatencyMs,
}: ExecutionTimelineGraphProps) {
  const items = Object.entries(individualResults || {});

  const maxLatency = Math.max(...items.map(([_, r]) => r.latency_ms || 1.0), totalLatencyMs || 10.0);

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-graphite-800 pb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-copper-400" />
          <h3 className="text-sm font-semibold text-white">Parallel Model Execution Timeline Graph</h3>
        </div>
        <span className="text-xs font-mono text-copper-400">Total Latency: {totalLatencyMs} ms</span>
      </div>

      <div className="space-y-3 pt-2">
        {items.map(([mType, res]) => {
          const percentage = Math.min(100, Math.max(8, (res.latency_ms / maxLatency) * 100));
          const isAllow = res.raw_result.toUpperCase() === "ALLOW";
          const isFlag = res.raw_result.toUpperCase() === "FLAG";

          return (
            <div key={mType} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">{mType}</span>
                  <span className="px-1.5 py-0.5 rounded bg-graphite-800 text-graphite-400 font-mono text-[10px]">
                    {res.framework}
                  </span>
                  <span className="font-mono text-[11px] text-graphite-400">{res.model_id}</span>
                </div>

                <div className="flex items-center space-x-3 font-mono text-[11px]">
                  <span className="text-graphite-300">{res.latency_ms} ms</span>
                  {isAllow ? (
                    <span className="text-emerald-400 font-bold">ALLOW ({res.score.toFixed(0)})</span>
                  ) : isFlag ? (
                    <span className="text-amber-400 font-bold">FLAG ({res.score.toFixed(0)})</span>
                  ) : (
                    <span className="text-rose-400 font-bold">BLOCK ({res.score.toFixed(0)})</span>
                  )}
                </div>
              </div>

              {/* Execution Latency Bar */}
              <div className="w-full bg-graphite-950 h-2 rounded-full overflow-hidden flex items-center">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isAllow ? "bg-emerald-500" : isFlag ? "bg-amber-500" : "bg-rose-500"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
