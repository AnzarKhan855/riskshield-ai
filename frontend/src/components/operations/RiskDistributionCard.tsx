"use client";

import React from "react";
import { DecisionRecord } from "@/types/decision";
import { BarChart3, Store, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface RiskDistributionCardProps {
  decisions: DecisionRecord[];
}

export default function RiskDistributionCard({ decisions }: RiskDistributionCardProps) {
  const blocks = decisions.filter((d) => d.decision === "BLOCK").length;
  const reviews = decisions.filter((d) => d.decision === "REVIEW").length;
  const approves = decisions.filter((d) => d.decision === "APPROVE").length;
  const total = decisions.length || 1;

  const blockPct = Math.round((blocks / total) * 100);
  const reviewPct = Math.round((reviews / total) * 100);
  const approvePct = Math.round((approves / total) * 100);

  const merchants = [
    { code: "MRC-98210", name: "Global Electronics Ltd", score: 88.5, level: "CRITICAL" },
    { code: "MRC-77123", name: "Alpha Digital Games", score: 79.2, level: "HIGH" },
    { code: "MRC-54129", name: "Apex Payment Gateway", score: 68.0, level: "HIGH" },
    { code: "MRC-11002", name: "Vanguard Tech Store", score: 55.4, level: "MEDIUM" },
    { code: "MRC-33901", name: "Omni Cloud Services", score: 42.1, level: "LOW" },
  ];

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-sm hover:border-graphite-700/60 transition-all flex flex-col h-[440px] w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-graphite-800 pb-4 mb-4 select-none shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <BarChart3 className="w-4 h-4 text-copper-400 shrink-0" />
          <h3 className="text-base font-bold text-white tracking-tight truncate">
            Risk Distribution & Merchant Ranking
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-copper-500/10 text-copper-400 border border-copper-500/20 shrink-0">
          GOVERNANCE
        </span>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4 pr-1">
        {/* Decision Breakdown Progress Bar */}
        <div className="bg-graphite-950 border border-graphite-800/80 rounded-xl p-3.5 space-y-2">
          <span className="text-[10px] font-bold text-graphite-400 uppercase tracking-wider block">
            Automated Action Ratios
          </span>
          <div className="w-full bg-graphite-900 h-2.5 rounded-full overflow-hidden flex">
            <div style={{ width: `${blockPct}%` }} className="bg-rose-500 h-full transition-all" title={`BLOCK ${blockPct}%`} />
            <div style={{ width: `${reviewPct}%` }} className="bg-amber-400 h-full transition-all" title={`REVIEW ${reviewPct}%`} />
            <div style={{ width: `${approvePct}%` }} className="bg-emerald-400 h-full transition-all" title={`APPROVE ${approvePct}%`} />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono pt-1">
            <span className="text-rose-400 font-semibold">BLOCK: {blockPct}%</span>
            <span className="text-amber-400 font-semibold">REVIEW: {reviewPct}%</span>
            <span className="text-emerald-400 font-semibold">APPROVE: {approvePct}%</span>
          </div>
        </div>

        {/* Merchant Ranking List */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-graphite-400 uppercase tracking-wider block px-1">
            High-Risk Merchant Leaderboard
          </span>
          {merchants.map((m) => (
            <div
              key={m.code}
              className="bg-graphite-950 border border-graphite-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs hover:border-graphite-700 transition-colors"
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span className="font-bold text-white font-mono truncate">{m.name}</span>
                <span className="text-[10px] text-copper-400 font-mono">{m.code}</span>
              </div>

              <div className="flex items-center space-x-2 shrink-0 font-mono text-[11px]">
                <span className="font-bold text-white">{m.score}/100</span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold font-mono border",
                    m.level === "CRITICAL"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : m.level === "HIGH"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  )}
                >
                  {m.level}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-graphite-800 pt-3 mt-3 flex items-center justify-between text-xs text-graphite-400 select-none shrink-0">
        <span className="font-mono text-[11px]">Active merchant monitoring</span>
        <Link
          href="/merchants"
          className="text-copper-400 font-semibold hover:underline flex items-center space-x-1"
        >
          <span>Merchant Registry</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
