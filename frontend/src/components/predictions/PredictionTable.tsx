"use client";

import React from "react";
import Link from "next/link";
import { Eye, ShieldAlert, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { PredictionRecord } from "@/types/prediction";
import { cn } from "@/lib/utils";

interface PredictionTableProps {
  predictions: PredictionRecord[];
  isLoading: boolean;
}

export default function PredictionTable({
  predictions,
  isLoading,
}: PredictionTableProps) {
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
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Predictions Logged</h3>
        <p className="text-xs text-graphite-400 max-w-sm mx-auto">
          No ML prediction history logs found. Execute an inference pipeline request to record predictions.
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
              <th className="px-6 py-4">Prediction & Txn ID</th>
              <th className="px-6 py-4">Prediction Result</th>
              <th className="px-6 py-4">Confidence Score</th>
              <th className="px-6 py-4">Model & Version</th>
              <th className="px-6 py-4">Inference Latency</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-graphite-800/60">
            {predictions.map((p) => {
              const res = p.prediction_result.toUpperCase();
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
                    {res === "ALLOW" ? (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ALLOW</span>
                      </span>
                    ) : res === "FLAG" ? (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>FLAG</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>BLOCK</span>
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 font-mono font-bold text-white text-sm">
                    {(p.confidence_score * 100).toFixed(1)}%
                  </td>

                  <td className="px-6 py-4 font-mono text-xs text-graphite-300">
                    {p.model_version}
                  </td>

                  <td className="px-6 py-4 font-mono text-xs text-graphite-300">
                    {p.inference_time_ms} ms
                  </td>

                  <td className="px-6 py-4 text-graphite-400 text-[11px]">
                    {new Date(p.prediction_timestamp || p.created_at).toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/predictions/${p.prediction_id}`}
                      className="p-1.5 rounded-lg bg-graphite-800 hover:bg-graphite-700 text-graphite-300 hover:text-copper-400 transition-colors inline-block"
                      title="Inspect Prediction Details"
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
