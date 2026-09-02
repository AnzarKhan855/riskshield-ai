"use client";

import React from "react";
import { BusinessRuleContributionRecord } from "@/types/explanation";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RuleImpactCardProps {
  rules: BusinessRuleContributionRecord[];
}

export default function RuleImpactCard({ rules }: RuleImpactCardProps) {
  if (!rules || rules.length === 0) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm space-y-2">
        <div className="flex items-center space-x-2 border-b border-graphite-800 pb-2">
          <ShieldAlert className="w-4 h-4 text-copper-400" />
          <h3 className="text-xs font-bold uppercase text-white">Triggered Policy Rules</h3>
        </div>
        <p className="text-xs text-graphite-400 italic">No hard policy rules were triggered for this decision.</p>
      </div>
    );
  }

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
        <ShieldAlert className="w-5 h-5 text-copper-400" />
        <h3 className="text-sm font-semibold text-white">Triggered Policy Rules ({rules.length})</h3>
      </div>

      <div className="space-y-3">
        {rules.map((r, idx) => (
          <div key={idx} className="bg-graphite-950 border border-graphite-800 rounded-lg p-3.5 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white font-mono">{r.rule_name}</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold font-mono border",
                  r.severity === "HIGH" || r.severity === "CRITICAL"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                )}
              >
                {r.severity} SEVERITY
              </span>
            </div>

            <p className="text-graphite-300 font-sans">{r.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
