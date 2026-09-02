"use client";

import React from "react";
import { Transaction } from "@/types/transaction";
import { DecisionRecord } from "@/types/decision";
import { InvestigationCaseRecord } from "@/types/investigation";
import { Activity, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LiveActivityWidgetProps {
  transactions: Transaction[];
  decisions: DecisionRecord[];
  cases: InvestigationCaseRecord[];
}

export default function LiveActivityWidget({
  transactions,
  decisions,
  cases,
}: LiveActivityWidgetProps) {
  return (
    <div className="space-y-4">
      {/* Live Transaction Feed */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-graphite-800 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-copper-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Live Transaction Activity Stream</h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 animate-pulse">&bull; STREAMING</span>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {transactions.length === 0 ? (
            <p className="text-xs text-graphite-400 italic text-center py-4">No live transactions recorded.</p>
          ) : (
            transactions.slice(0, 7).map((t) => (
              <div
                key={t.id}
                className="bg-graphite-950 border border-graphite-800/80 rounded-lg p-2.5 flex items-center justify-between text-xs hover:border-copper-500/40 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-mono font-bold text-white">{t.transaction_id}</span>
                  <span className="text-[10px] text-graphite-400">{t.payment_method} &bull; {t.country}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-emerald-400">${t.amount.toFixed(2)}</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold font-mono border",
                      t.status === "Success"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    )}
                  >
                    {t.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Latest Decision Outcomes Stream */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-graphite-800 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-copper-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Decision Intelligence Stream</h3>
          </div>
          <Link href="/decisions" className="text-[10px] font-mono text-copper-400 hover:underline">
            View All &rarr;
          </Link>
        </div>

        <div className="space-y-2 max-h-[240px] overflow-y-auto">
          {decisions.slice(0, 5).map((d) => {
            const dec = d.decision.toUpperCase();
            return (
              <div key={d.id} className="bg-graphite-950 border border-graphite-800/80 rounded-lg p-2.5 flex items-center justify-between text-xs">
                <div className="flex flex-col">
                  <span className="font-mono font-bold text-white">{d.decision_id}</span>
                  <span className="text-[10px] text-graphite-400 truncate max-w-[160px]">{d.decision_reason}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[10px] text-graphite-300">{d.composite_risk_score.toFixed(1)}/100</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold font-mono border",
                      dec === "BLOCK"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : dec === "REVIEW"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    )}
                  >
                    {dec}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
