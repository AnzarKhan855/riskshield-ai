"use client";

import React from "react";
import { ShieldAlert, Activity, CheckCircle2, AlertTriangle, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompositeRiskCardProps {
  overallRiskScore: number;
  confidence: number;
  riskLevel: string;
  executionTimeMs: number;
}

export default function CompositeRiskCard({
  overallRiskScore,
  confidence,
  riskLevel,
  executionTimeMs,
}: CompositeRiskCardProps) {
  const lvl = riskLevel.toUpperCase();
  const isCritical = lvl === "CRITICAL";
  const isHigh = lvl === "HIGH";
  const isMedium = lvl === "MEDIUM";

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Left Risk Gauge & Score */}
      <div className="flex items-center space-x-6">
        <div className="relative flex items-center justify-center">
          <div
            className={cn(
              "w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center bg-graphite-950",
              isCritical
                ? "border-rose-500 text-rose-400"
                : isHigh
                ? "border-rose-400 text-rose-300"
                : isMedium
                ? "border-amber-400 text-amber-400"
                : "border-emerald-400 text-emerald-400"
            )}
          >
            <span className="text-2xl font-extrabold font-mono tracking-tight">
              {overallRiskScore.toFixed(0)}
            </span>
            <span className="text-[10px] font-semibold uppercase text-graphite-400">
              Risk Score
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-graphite-400 font-semibold uppercase">Composite Risk Assessment</span>
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border",
                isCritical
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  : isHigh
                  ? "bg-rose-400/10 border-rose-400/30 text-rose-300"
                  : isMedium
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              )}
            >
              {lvl} RISK
            </span>
          </div>

          <p className="text-xs text-graphite-300 mt-1 max-w-md">
            Synthesized composite risk rating computed across active production AI models.
          </p>
        </div>
      </div>

      {/* Right Details */}
      <div className="flex items-center space-x-6 border-t md:border-t-0 md:border-l border-graphite-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-around md:justify-end">
        <div>
          <span className="text-[11px] text-graphite-400 font-medium">Confidence Score</span>
          <p className="text-lg font-bold text-white font-mono mt-0.5">
            {(confidence * 100).toFixed(1)}%
          </p>
        </div>

        <div>
          <span className="text-[11px] text-graphite-400 font-medium">Orchestration Latency</span>
          <p className="text-lg font-bold text-sky-400 font-mono mt-0.5">
            {executionTimeMs} ms
          </p>
        </div>
      </div>
    </div>
  );
}
