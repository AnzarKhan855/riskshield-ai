"use client";

import React from "react";
import { FeatureContributionRecord } from "@/types/explanation";
import { BarChart2, ShieldAlert, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureAttributionBarProps {
  features: FeatureContributionRecord[];
}

export default function FeatureAttributionBar({ features }: FeatureAttributionBarProps) {
  if (!features || features.length === 0) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 text-center italic text-xs text-graphite-400">
        No feature attribution payload available.
      </div>
    );
  }

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
        <BarChart2 className="w-5 h-5 text-copper-400" />
        <h3 className="text-sm font-semibold text-white">Top Feature Contributions & SHAP Attribution</h3>
      </div>

      <div className="space-y-4">
        {features.map((f, idx) => {
          const isIncrease = f.direction === "INCREASES_RISK";
          const widthPct = Math.min(100, Math.round(f.importance_score * 200));

          return (
            <div key={idx} className="bg-graphite-950 border border-graphite-800 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 font-mono">
                  <span className="font-bold text-white">{f.feature_name}</span>
                  <span className="text-graphite-400">({String(f.feature_value)})</span>
                </div>

                <div className="flex items-center space-x-2 font-mono">
                  <span className="text-graphite-400">SHAP:</span>
                  <span className={cn("font-bold flex items-center space-x-0.5", isIncrease ? "text-rose-400" : "text-emerald-400")}>
                    {isIncrease ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{f.shap_value > 0 ? `+${f.shap_value.toFixed(2)}` : f.shap_value.toFixed(2)}</span>
                  </span>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="w-full bg-graphite-900 h-2 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${widthPct}%` }}
                  className={cn("h-full rounded-full transition-all duration-500", isIncrease ? "bg-rose-500" : "bg-emerald-400")}
                />
              </div>

              <p className="text-[11px] text-graphite-300 font-sans">{f.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
