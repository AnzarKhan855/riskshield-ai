"use client";

import React from "react";
import { ModelRegistryRecord } from "@/types/model_registry";
import { Cpu, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface AIModelsStatusCardProps {
  models: ModelRegistryRecord[];
}

export default function AIModelsStatusCard({ models }: AIModelsStatusCardProps) {
  const defaultModels = [
    { id: "1", model_name: "XGBoost-Fraud-Ensemble", version: "2.1.0", framework: "XGBoost", latency: "2.4ms", status: "Active" },
    { id: "2", model_name: "IsolationForest-Anomaly", version: "1.4.2", framework: "Scikit-Learn", latency: "1.8ms", status: "Active" },
    { id: "3", model_name: "BiLSTM-Behavioral-Vector", version: "3.0.1", framework: "PyTorch", latency: "4.2ms", status: "Active" },
    { id: "4", model_name: "GraphSAGE-Entity-Mesh", version: "1.2.0", framework: "DGL / PyTorch", latency: "5.1ms", status: "Active" },
  ];

  const displayModels = models && models.length > 0 ? models : defaultModels;

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-sm hover:border-graphite-700/60 transition-all flex flex-col h-[420px] w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-graphite-800 pb-4 mb-4 select-none shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <Cpu className="w-4 h-4 text-copper-400 shrink-0" />
          <h3 className="text-base font-bold text-white tracking-tight truncate">
            AI Model Serving Status
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
          4 ACTIVE
        </span>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
        {displayModels.map((m, idx) => (
          <div
            key={m.id || idx}
            className="bg-graphite-950 border border-graphite-800/80 rounded-xl p-3 space-y-1.5 hover:border-graphite-700 transition-colors"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-white truncate pr-2">
                {m.model_name}
              </span>
              <span className="font-mono text-[10px] text-copper-400 shrink-0">
                v{m.version}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-graphite-400 font-mono">
              <span>Framework: {m.framework}</span>
              <span className="text-emerald-400 font-bold flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5" />
                SERVING 100%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-graphite-800 pt-3 mt-3 flex items-center justify-between text-xs text-graphite-400 select-none shrink-0">
        <span className="font-mono text-[11px]">Sub-10ms inference SLA</span>
        <Link
          href="/models"
          className="text-copper-400 font-semibold hover:underline flex items-center space-x-1"
        >
          <span>Model Registry</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
