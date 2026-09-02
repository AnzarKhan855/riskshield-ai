"use client";

import React from "react";
import Link from "next/link";
import { Eye, Cpu, ShieldCheck } from "lucide-react";
import { ExplanationRecord } from "@/types/explanation";
import { cn } from "@/lib/utils";

interface ExplanationTableProps {
  items: ExplanationRecord[];
  isLoading: boolean;
}

export default function ExplanationTable({ items, isLoading }: ExplanationTableProps) {
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

  if (!items || items.length === 0) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-graphite-800 text-copper-400 flex items-center justify-center mx-auto">
          <Cpu className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No AI Explanations Found</h3>
        <p className="text-xs text-graphite-400 max-w-sm mx-auto">
          Generate an AI decision explanation to inspect feature attributions and audit rationales.
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
              <th className="px-6 py-4">Explanation ID</th>
              <th className="px-6 py-4">Linked Decision ID</th>
              <th className="px-6 py-4">Target Txn ID</th>
              <th className="px-6 py-4">Risk Score</th>
              <th className="px-6 py-4">Confidence</th>
              <th className="px-6 py-4">Primary Rationale</th>
              <th className="px-6 py-4">Audited At</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-graphite-800/60">
            {items.map((e) => {
              const score = e.composite_risk_score;
              return (
                <tr key={e.id} className="hover:bg-graphite-800/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-copper-400">
                    {e.explanation_id}
                  </td>

                  <td className="px-6 py-4 font-mono text-white font-semibold">
                    {e.decision_id}
                  </td>

                  <td className="px-6 py-4 font-mono text-graphite-300">
                    {e.transaction_id}
                  </td>

                  <td className="px-6 py-4 font-mono">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded text-[10px] font-bold border",
                        score >= 80
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : score >= 50
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      )}
                    >
                      {score.toFixed(1)} / 100
                    </span>
                  </td>

                  <td className="px-6 py-4 font-mono text-emerald-400 font-bold">
                    {e.confidence_score.toFixed(1)}%
                  </td>

                  <td className="px-6 py-4 font-sans text-graphite-300 truncate max-w-xs">
                    {e.primary_reason}
                  </td>

                  <td className="px-6 py-4 text-graphite-400 text-[11px]">
                    {new Date(e.created_at).toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/explanations/${e.decision_id}`}
                      className="px-3 py-1.5 rounded-lg bg-copper-500/10 border border-copper-500/30 hover:bg-copper-500/20 text-copper-400 font-semibold text-xs transition-colors inline-flex items-center space-x-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Workspace</span>
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
