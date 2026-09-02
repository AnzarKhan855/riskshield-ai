"use client";

import React from "react";
import { InvestigationCaseRecord } from "@/types/investigation";
import { ShieldAlert, ArrowRight, UserCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface InvestigationQueueCardProps {
  cases: InvestigationCaseRecord[];
}

export default function InvestigationQueueCard({ cases }: InvestigationQueueCardProps) {
  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-sm hover:border-graphite-700/60 transition-all flex flex-col h-[440px] w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-graphite-800 pb-4 mb-4 select-none shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <h3 className="text-base font-bold text-white tracking-tight truncate">
            Priority Investigation Queue
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
          TRIAGE
        </span>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
        {cases.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-graphite-500">
            <ShieldAlert className="w-8 h-8 text-graphite-600" />
            <p className="text-xs font-mono">No active escalation cases</p>
          </div>
        ) : (
          cases.map((c) => {
            const prio = c.priority.toUpperCase();
            return (
              <div
                key={c.id}
                className="bg-graphite-950 border border-graphite-800/80 rounded-xl p-3 space-y-2 hover:border-copper-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-copper-400">
                    {c.case_id}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold font-mono border",
                      prio === "CRITICAL"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : prio === "HIGH"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-sky-500/10 text-sky-400 border-sky-500/30"
                    )}
                  >
                    {prio}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-white truncate">
                  {c.case_title}
                </h4>

                <div className="flex items-center justify-between pt-1 border-t border-graphite-800/60 text-[11px] font-mono text-graphite-400">
                  <span>Analyst: {c.assigned_analyst_name || "Unassigned"}</span>
                  <Link
                    href={`/cases/${c.case_id}`}
                    className="text-copper-400 font-semibold hover:underline flex items-center space-x-1"
                  >
                    <span>Investigate</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-graphite-800 pt-3 mt-3 flex items-center justify-between text-xs text-graphite-400 select-none shrink-0">
        <span className="font-mono text-[11px]">
          {cases.filter((c) => c.status === "OPEN").length} open cases pending resolution
        </span>
        <Link
          href="/cases"
          className="text-copper-400 font-semibold hover:underline flex items-center space-x-1"
        >
          <span>Case Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
