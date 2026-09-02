"use client";

import React from "react";
import Link from "next/link";
import { Eye, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, UserCheck } from "lucide-react";
import { InvestigationCaseRecord } from "@/types/investigation";
import { cn } from "@/lib/utils";

interface CaseTableProps {
  cases: InvestigationCaseRecord[];
  isLoading: boolean;
}

export default function CaseTable({ cases, isLoading }: CaseTableProps) {
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

  if (!cases || cases.length === 0) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-graphite-800 text-copper-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Investigation Cases Found</h3>
        <p className="text-xs text-graphite-400 max-w-sm mx-auto">
          No active or resolved investigation cases match your filters. Create a new case or clear filters.
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
              <th className="px-6 py-4">Case ID & Title</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Target Txn</th>
              <th className="px-6 py-4">Assigned Analyst</th>
              <th className="px-6 py-4">Opened At</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-graphite-800/60">
            {cases.map((c) => {
              const prio = c.priority.toUpperCase();
              const st = c.status.toUpperCase();
              return (
                <tr key={c.id} className="hover:bg-graphite-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{c.case_title}</span>
                      <span className="text-[11px] font-mono text-copper-400">{c.case_id}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border",
                        prio === "CRITICAL"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : prio === "HIGH"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      )}
                    >
                      {prio}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded text-[10px] font-bold font-mono border",
                        st === "RESOLVED" || st === "CLOSED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : st === "UNDER_INVESTIGATION"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-graphite-800 text-copper-400 border-graphite-700"
                      )}
                    >
                      {st}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-mono text-xs text-graphite-300">
                    {c.category}
                  </td>

                  <td className="px-6 py-4 font-mono text-xs text-copper-400">
                    {c.transaction_id}
                  </td>

                  <td className="px-6 py-4 font-mono text-xs text-graphite-300">
                    {c.assigned_analyst_name || "Unassigned"}
                  </td>

                  <td className="px-6 py-4 text-graphite-400 text-[11px]">
                    {new Date(c.opened_at).toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/cases/${c.case_id}`}
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
