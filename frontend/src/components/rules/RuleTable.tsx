"use client";

import React from "react";
import Link from "next/link";
import { Eye, Edit3, Trash2, Power, Layers } from "lucide-react";
import { DecisionRuleRecord } from "@/types/decision_rule";
import { usePublishRule, useDeleteRule } from "@/hooks/useRules";
import { cn } from "@/lib/utils";

interface RuleTableProps {
  rules: DecisionRuleRecord[];
  isLoading: boolean;
}

export default function RuleTable({ rules, isLoading }: RuleTableProps) {
  const publishMutation = usePublishRule();
  const deleteMutation = useDeleteRule();

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

  if (!rules || rules.length === 0) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-graphite-800 text-copper-400 flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Decision Rules Found</h3>
        <p className="text-xs text-graphite-400 max-w-sm mx-auto">
          No business rules exist in the Rule Studio. Create a new decision rule to start configuring risk policy.
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
              <th className="px-6 py-4">Rule Name & ID</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Expression</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-graphite-800/60">
            {rules.map((r) => {
              const act = r.action.toUpperCase();
              return (
                <tr key={r.id} className="hover:bg-graphite-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{r.rule_name}</span>
                      <span className="text-[11px] font-mono text-copper-400">{r.rule_id}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-graphite-800 text-graphite-300 font-mono text-[10px] font-semibold">
                      {r.rule_category}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-mono font-bold text-white">
                    P-{r.priority}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold font-mono border",
                        act === "BLOCK"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : act === "ESCALATE"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                          : act === "REVIEW"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      )}
                    >
                      {act}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold font-mono border",
                        r.status === "PUBLISHED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-graphite-800 text-graphite-400 border-graphite-700"
                      )}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-mono text-[11px] text-graphite-300 max-w-xs truncate">
                    {r.expression}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => publishMutation.mutate(r.rule_id)}
                        className="p-1.5 rounded-lg bg-graphite-800 hover:bg-graphite-700 text-graphite-300 hover:text-emerald-400 transition-colors"
                        title="Publish / Activate Rule"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href={`/rules/${r.rule_id}`}
                        className="p-1.5 rounded-lg bg-graphite-800 hover:bg-graphite-700 text-graphite-300 hover:text-copper-400 transition-colors"
                        title="Inspect Rule Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => deleteMutation.mutate(r.rule_id)}
                        className="p-1.5 rounded-lg bg-graphite-800 hover:bg-graphite-700 text-graphite-300 hover:text-rose-400 transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
