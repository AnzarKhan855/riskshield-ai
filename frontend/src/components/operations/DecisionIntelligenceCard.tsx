"use client";

import React from "react";
import { DecisionRecord } from "@/types/decision";
import { ShieldCheck, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DecisionIntelligenceCardProps {
  decisions: DecisionRecord[];
}

export default function DecisionIntelligenceCard({ decisions }: DecisionIntelligenceCardProps) {
  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-sm hover:border-graphite-700/60 transition-all flex flex-col h-[440px] w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-graphite-800 pb-4 mb-4 select-none shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
          <h3 className="text-base font-bold text-white tracking-tight truncate">
            Decision Intelligence Stream
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
          POLICY ENGINE
        </span>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
        {decisions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-graphite-500">
            <ShieldAlert className="w-8 h-8 text-graphite-600" />
            <p className="text-xs font-mono">No automated decisions logged yet</p>
          </div>
        ) : (
          decisions.map((d) => {
            const dec = d.decision.toUpperCase();
            return (
              <div
                key={d.id}
                className="bg-graphite-950 border border-graphite-800/80 rounded-xl p-3 flex items-center justify-between text-xs hover:border-copper-500/40 transition-colors"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <Link
                    href={`/decisions/${d.decision_id}`}
                    className="font-mono font-bold text-white hover:text-copper-400 truncate transition-colors"
                  >
                    {d.decision_id}
                  </Link>
                  <span className="text-[11px] text-graphite-400 truncate">
                    TXN: {d.transaction_id} &bull; {d.decision_reason || "Evaluated AST Policy"}
                  </span>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <span className="font-mono font-bold text-white text-xs block">
                      {d.composite_risk_score.toFixed(1)}
                    </span>
                    <span className="text-[9px] font-mono text-graphite-500">/ 100</span>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded text-[10px] font-bold font-mono border",
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
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-graphite-800 pt-3 mt-3 flex items-center justify-between text-xs text-graphite-400 select-none shrink-0">
        <span className="font-mono text-[11px]">
          Showing {Math.min(decisions.length, 10)} real-time outcomes
        </span>
        <Link
          href="/decisions"
          className="text-copper-400 font-semibold hover:underline flex items-center space-x-1"
        >
          <span>Decision Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
