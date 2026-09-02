"use client";

import React from "react";
import { ModelRegistryRecord } from "@/types/model_registry";
import { Gauge, Zap, Target, Activity } from "lucide-react";

interface ModelMetricsCardProps {
  model: ModelRegistryRecord;
}

export default function ModelMetricsCard({ model }: ModelMetricsCardProps) {
  const metrics = [
    { label: "Accuracy", value: (model.accuracy * 100).toFixed(1) + "%", raw: model.accuracy, color: "text-emerald-400" },
    { label: "Precision", value: (model.precision * 100).toFixed(1) + "%", raw: model.precision, color: "text-copper-400" },
    { label: "Recall", value: (model.recall * 100).toFixed(1) + "%", raw: model.recall, color: "text-copper-400" },
    { label: "F1 Score", value: (model.f1_score * 100).toFixed(1) + "%", raw: model.f1_score, color: "text-emerald-400" },
    { label: "ROC AUC", value: (model.roc_auc * 100).toFixed(1) + "%", raw: model.roc_auc, color: "text-amber-400" },
    { label: "Inference Latency", value: model.latency_ms + " ms", raw: 1.0, color: "text-sky-400" },
  ];

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-graphite-800 pb-3">
        <div className="flex items-center space-x-2">
          <Gauge className="w-5 h-5 text-copper-400" />
          <h3 className="text-sm font-semibold text-white">Validation & Benchmark Performance Metrics</h3>
        </div>
        <span className="text-xs text-graphite-400 font-mono">Dataset: {model.training_dataset_version}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-graphite-950 border border-graphite-800 rounded-lg p-3 flex flex-col justify-between"
          >
            <span className="text-[11px] font-medium text-graphite-400">{m.label}</span>
            <span className={`text-lg font-extrabold font-mono mt-1 ${m.color}`}>{m.value}</span>
            {m.label !== "Inference Latency" && (
              <div className="w-full bg-graphite-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-copper-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, m.raw * 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
