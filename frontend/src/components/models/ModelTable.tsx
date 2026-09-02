"use client";

import React from "react";
import Link from "next/link";
import { Eye, ShieldCheck, Cpu, ArrowUpRight } from "lucide-react";
import { ModelRegistryRecord } from "@/types/model_registry";
import { cn } from "@/lib/utils";

interface ModelTableProps {
  models: ModelRegistryRecord[];
  isLoading: boolean;
  onPromote?: (modelId: string) => void;
  isPromoting?: boolean;
}

export default function ModelTable({
  models,
  isLoading,
  onPromote,
  isPromoting,
}: ModelTableProps) {
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

  if (!models || models.length === 0) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-graphite-800 text-copper-400 flex items-center justify-center mx-auto">
          <Cpu className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Models Registered</h3>
        <p className="text-xs text-graphite-400 max-w-sm mx-auto">
          No AI models have been registered in the ModelRegistry. Register a new model to start serving ML predictions.
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
              <th className="px-6 py-4">Model & ID</th>
              <th className="px-6 py-4">Domain Type</th>
              <th className="px-6 py-4">Framework</th>
              <th className="px-6 py-4">Accuracy / F1</th>
              <th className="px-6 py-4">Latency</th>
              <th className="px-6 py-4">Production Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-graphite-800/60">
            {models.map((m) => (
              <tr key={m.id} className="hover:bg-graphite-800/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white text-sm">{m.model_name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-graphite-800 text-graphite-300 font-mono text-[10px]">
                        {m.version}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-copper-400 mt-0.5">
                      {m.model_id}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 font-semibold text-graphite-200 text-xs">
                  {m.model_type}
                </td>

                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded bg-copper-500/10 border border-copper-500/30 text-copper-400 font-mono font-medium text-[11px]">
                    {m.framework}
                  </span>
                </td>

                <td className="px-6 py-4 font-mono">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-emerald-400 font-bold">{(m.accuracy * 100).toFixed(1)}% Acc</span>
                    <span className="text-graphite-400">&bull;</span>
                    <span className="text-white">{(m.f1_score * 100).toFixed(1)}% F1</span>
                  </div>
                </td>

                <td className="px-6 py-4 font-mono text-xs text-graphite-300">
                  {m.latency_ms} ms
                </td>

                <td className="px-6 py-4">
                  {m.production_flag ? (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>PRODUCTION</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-graphite-800 text-graphite-400">
                      <span>{m.model_status}</span>
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {!m.production_flag && onPromote && (
                      <button
                        onClick={() => onPromote(m.model_id)}
                        disabled={isPromoting}
                        className="px-2.5 py-1 rounded bg-graphite-800 hover:bg-graphite-700 text-copper-400 hover:text-copper-300 font-medium text-[11px] transition-colors flex items-center space-x-1"
                        title="Promote to Production"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        <span>Promote</span>
                      </button>
                    )}

                    <Link
                      href={`/models/${m.model_id}`}
                      className="p-1.5 rounded-lg bg-graphite-800 hover:bg-graphite-700 text-graphite-300 hover:text-copper-400 transition-colors"
                      title="Inspect Model Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
