"use client";

import React from "react";
import { InvestigationCaseRecord } from "@/types/investigation";
import { ShieldAlert, Clock, ArrowRight, UserCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface InvestigationQueueWidgetProps {
  cases: InvestigationCaseRecord[];
}

export default function InvestigationQueueWidget({ cases }: InvestigationQueueWidgetProps) {
  return (
    <div className="space-y-4">
      {/* Active Investigation Queue */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-graphite-800 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-copper-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Active Investigation Queue</h3>
          </div>
          <Link href="/cases" className="text-[10px] font-mono text-copper-400 hover:underline">
            View All &rarr;
          </Link>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {cases.length === 0 ? (
            <p className="text-xs text-graphite-400 italic text-center py-4">No active investigation cases.</p>
          ) : (
            cases.slice(0, 6).map((c) => {
              const prio = c.priority.toUpperCase();
              return (
                <div
                  key={c.id}
                  className="bg-graphite-950 border border-graphite-800/80 rounded-lg p-3 space-y-1 hover:border-copper-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-copper-400">{c.case_id}</span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold font-mono border",
                        prio === "CRITICAL"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      )}
                    >
                      {prio}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white truncate">{c.case_title}</h4>

                  <div className="flex items-center justify-between pt-1 border-t border-graphite-800/60 text-[10px] font-mono text-graphite-400">
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
      </div>

      {/* Real-Time Platform Activity Timeline */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
          <Clock className="w-4 h-4 text-copper-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Live Platform Operations Timeline</h3>
        </div>

        <div className="relative pl-4 space-y-3 text-xs font-mono before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-graphite-800">
          <div className="relative flex items-center justify-between">
            <div className="absolute -left-4 w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white">AI Rule Studio Policy Published</span>
            <span className="text-graphite-400 text-[10px]">2m ago</span>
          </div>

          <div className="relative flex items-center justify-between">
            <div className="absolute -left-4 w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-white">Critical Velocity Case Opened</span>
            <span className="text-graphite-400 text-[10px]">5m ago</span>
          </div>

          <div className="relative flex items-center justify-between">
            <div className="absolute -left-4 w-2 h-2 rounded-full bg-copper-400" />
            <span className="text-white">Model XGBoost-v2 Promoted</span>
            <span className="text-graphite-400 text-[10px]">12m ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
