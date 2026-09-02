"use client";

import React from "react";
import { SystemHealthMetrics } from "@/types/operations";
import { ModelRegistryRecord } from "@/types/model_registry";
import { Cpu, Activity, Zap, CheckCircle2, ShieldCheck, Database } from "lucide-react";

interface SystemHealthWidgetProps {
  health: SystemHealthMetrics;
  models: ModelRegistryRecord[];
}

export default function SystemHealthWidget({ health, models }: SystemHealthWidgetProps) {
  return (
    <div className="space-y-4">
      {/* Platform Throughput Overview */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
          <Activity className="w-4 h-4 text-copper-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">System Throughput & Telemetry</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-graphite-950 border border-graphite-800 rounded-lg p-3 space-y-1">
            <span className="text-[10px] font-bold text-graphite-400 uppercase">Live Throughput</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold font-mono text-emerald-400">{health.throughput_tps}</span>
              <span className="text-[10px] font-mono text-graphite-400">TPS</span>
            </div>
          </div>

          <div className="bg-graphite-950 border border-graphite-800 rounded-lg p-3 space-y-1">
            <span className="text-[10px] font-bold text-graphite-400 uppercase">Avg P99 Latency</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold font-mono text-copper-400">{health.avg_latency_ms}</span>
              <span className="text-[10px] font-mono text-graphite-400">ms</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-graphite-950 border border-graphite-800 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-graphite-400">Decision Engine Latency Budget</span>
            <span className="font-mono text-emerald-400 font-bold">12.4ms / 50ms</span>
          </div>
          <div className="w-full bg-graphite-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full w-1/4 rounded-full" />
          </div>
        </div>
      </div>

      {/* AI Model Health Card */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-graphite-800 pb-3">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-copper-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">AI Models Serving Status</h3>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold">
            {models.filter((m) => m.model_status === "Active").length || 3} ACTIVE
          </span>
        </div>

        <div className="space-y-2">
          {models.slice(0, 4).map((m) => (
            <div key={m.id} className="bg-graphite-950 border border-graphite-800/80 rounded-lg p-2.5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white font-mono">{m.model_name}</span>
                <span className="font-mono text-[10px] text-copper-400">v{m.version}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-graphite-400 font-mono">
                <span>Framework: {m.framework}</span>
                <span className="text-emerald-400 font-bold">SERVING 100%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
