"use client";

import React from "react";
import Link from "next/link";
import { Eye, Cpu, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { FeatureStoreRecord } from "@/types/feature";

interface FeatureVectorTableProps {
  vectors: FeatureStoreRecord[];
  isLoading: boolean;
  onRecompute: (txnId: string) => void;
  isRecomputing: boolean;
}

export default function FeatureVectorTable({
  vectors,
  isLoading,
  onRecompute,
  isRecomputing,
}: FeatureVectorTableProps) {
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

  if (!vectors || vectors.length === 0) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-graphite-800 text-copper-400 flex items-center justify-center mx-auto">
          <Cpu className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Feature Vectors Found</h3>
        <p className="text-xs text-graphite-400 max-w-sm mx-auto">
          No ML feature vectors have been generated yet. Use the generate API to create feature payloads.
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
              <th className="px-6 py-4">Vector ID & Txn</th>
              <th className="px-6 py-4">Version & Group</th>
              <th className="px-6 py-4">Feature Count</th>
              <th className="px-6 py-4">Prediction Readiness</th>
              <th className="px-6 py-4">Generated At</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-graphite-800/60">
            {vectors.map((vec) => (
              <tr
                key={vec.id}
                className="hover:bg-graphite-800/40 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-mono text-sm font-semibold text-copper-400">
                      {vec.feature_vector_id}
                    </span>
                    <span className="text-[11px] font-mono text-graphite-400">
                      Txn: {vec.transaction_id}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-graphite-800 border border-graphite-700 text-white font-mono text-[11px]">
                      {vec.feature_version}
                    </span>
                    <span className="text-graphite-400 text-[11px]">{vec.feature_group}</span>
                  </div>
                </td>

                <td className="px-6 py-4 font-bold text-white text-sm">
                  {vec.feature_count} features
                </td>

                <td className="px-6 py-4">
                  {vec.prediction_ready ? (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                      <AlertCircle className="w-3 h-3" />
                      <span>Invalid</span>
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-graphite-400 text-[11px]">
                  {new Date(vec.created_at).toLocaleString()}
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onRecompute(vec.transaction_id)}
                      disabled={isRecomputing}
                      className="p-1.5 rounded-lg bg-graphite-800 hover:bg-graphite-700 text-graphite-300 hover:text-copper-400 transition-colors"
                      title="Recompute Feature Vector"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <Link
                      href={`/features/${vec.transaction_id}`}
                      className="p-1.5 rounded-lg bg-graphite-800 hover:bg-graphite-700 text-graphite-300 hover:text-copper-400 transition-colors"
                      title="Inspect Feature Vector"
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
