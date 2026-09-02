"use client";

import React from "react";
import { ModelContributionRecord } from "@/types/explanation";
import { Cpu, CheckCircle2, ShieldCheck } from "lucide-react";

interface ModelEnsembleBreakdownProps {
  models: ModelContributionRecord[];
}

export default function ModelEnsembleBreakdown({ models }: ModelEnsembleBreakdownProps) {
  if (!models || models.length === 0) {
    return null;
  }

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
        <Cpu className="w-5 h-5 text-copper-400" />
        <h3 className="text-sm font-semibold text-white">AI Model Ensemble Weights & Predictions</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((m) => (
          <div key={m.model_id} className="bg-graphite-950 border border-graphite-800 rounded-lg p-4 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{m.model_name}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                {m.status}
              </span>
            </div>

            <div className="text-[11px] text-graphite-400">Model ID: {m.model_id} &bull; Type: {m.model_type}</div>

            <div className="pt-2 border-t border-graphite-800 space-y-1 text-graphite-300">
              <div className="flex items-center justify-between">
                <span>Ensemble Weight:</span>
                <span className="font-bold text-copper-400">{(m.weight * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Model Risk Prediction:</span>
                <span className="font-bold text-white">{m.risk_score.toFixed(1)} / 100</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
