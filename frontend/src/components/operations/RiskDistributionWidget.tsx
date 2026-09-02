"use client";

import React from "react";
import { DecisionRecord } from "@/types/decision";
import { ShieldAlert, BarChart3, Globe, Store } from "lucide-react";

interface RiskDistributionWidgetProps {
  decisions: DecisionRecord[];
}

export default function RiskDistributionWidget({ decisions }: RiskDistributionWidgetProps) {
  const blocks = decisions.filter((d) => d.decision === "BLOCK").length;
  const reviews = decisions.filter((d) => d.decision === "REVIEW").length;
  const approves = decisions.filter((d) => d.decision === "APPROVE").length;
  const total = decisions.length || 1;

  const blockPct = Math.round((blocks / total) * 100);
  const reviewPct = Math.round((reviews / total) * 100);
  const approvePct = Math.round((approves / total) * 100);

  return (
    <div className="space-y-4">
      {/* Decision Distribution Bar */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
          <BarChart3 className="w-4 h-4 text-copper-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Decision Action Distribution</h3>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-graphite-950 h-3 rounded-full overflow-hidden flex">
            <div style={{ width: `${blockPct}%` }} className="bg-rose-500 h-full" title={`BLOCK ${blockPct}%`} />
            <div style={{ width: `${reviewPct}%` }} className="bg-amber-400 h-full" title={`REVIEW ${reviewPct}%`} />
            <div style={{ width: `${approvePct}%` }} className="bg-emerald-400 h-full" title={`APPROVE ${approvePct}%`} />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono pt-1">
            <span className="text-rose-400 font-bold">BLOCK: {blocks} ({blockPct}%)</span>
            <span className="text-amber-400 font-bold">REVIEW: {reviews} ({reviewPct}%)</span>
            <span className="text-emerald-400 font-bold">APPROVE: {approves} ({approvePct}%)</span>
          </div>
        </div>
      </div>

      {/* Merchant Risk Leaderboard */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
          <Store className="w-4 h-4 text-copper-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">High-Risk Merchant Ranking</h3>
        </div>

        <div className="space-y-2">
          {[
            { code: "MRC-98210", name: "Global Electronics Ltd", score: 88.5, level: "CRITICAL" },
            { code: "MRC-77123", name: "Alpha Digital Games", score: 79.2, level: "HIGH" },
            { code: "MRC-54129", name: "Apex Payment Gateway", score: 68.0, level: "HIGH" },
            { code: "MRC-11002", name: "Vanguard Tech Store", score: 55.4, level: "MEDIUM" },
          ].map((m) => (
            <div key={m.code} className="bg-graphite-950 border border-graphite-800/80 rounded-lg p-2.5 flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="font-bold text-white font-mono">{m.name}</span>
                <span className="text-[10px] text-copper-400 font-mono">{m.code}</span>
              </div>

              <div className="flex items-center space-x-2 font-mono text-[10px]">
                <span className="font-bold text-white">{m.score}/100</span>
                <span className={m.level === "CRITICAL" ? "text-rose-400 font-bold" : "text-amber-400 font-bold"}>
                  {m.level}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Country Risk Heat Overview */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
          <Globe className="w-4 h-4 text-copper-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Geographic Fraud Heat Overview</h3>
        </div>

        <div className="space-y-2 text-xs font-mono">
          {[
            { country: "India", count: 1240, risk: "MEDIUM" },
            { country: "United States", count: 850, risk: "LOW" },
            { country: "Russia", count: 420, risk: "HIGH" },
            { country: "Nigeria", count: 310, risk: "CRITICAL" },
          ].map((c) => (
            <div key={c.country} className="flex items-center justify-between bg-graphite-950 p-2 rounded border border-graphite-800">
              <span className="text-white font-semibold">{c.country}</span>
              <div className="flex items-center space-x-2">
                <span className="text-graphite-400">{c.count} txns</span>
                <span className={c.risk === "CRITICAL" ? "text-rose-400 font-bold" : c.risk === "HIGH" ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                  {c.risk}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
