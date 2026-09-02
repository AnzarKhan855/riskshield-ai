"use client";

import React from "react";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AuditTimelineCard() {
  const events = [
    { title: "AI Rule Studio Policy Published", time: "2m ago", color: "bg-emerald-400" },
    { title: "Critical Velocity Case Opened (#CAS-8910)", time: "5m ago", color: "bg-rose-400" },
    { title: "Model XGBoost-Fraud-v2.1 Promoted to Prod", time: "12m ago", color: "bg-copper-400" },
    { title: "Zero-Trust JWT Key Rotation Succeeded", time: "18m ago", color: "bg-sky-400" },
    { title: "Graph Clustering Entity Mesh Refreshed", time: "25m ago", color: "bg-purple-400" },
    { title: "FCRA Adverse Notice Dispatched to Queue", time: "34m ago", color: "bg-emerald-400" },
    { title: "High-Volume Batch Ingest Completed (250k)", time: "48m ago", color: "bg-copper-400" },
  ];

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-sm hover:border-graphite-700/60 transition-all flex flex-col h-[420px] w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-graphite-800 pb-4 mb-4 select-none shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <Clock className="w-4 h-4 text-copper-400 shrink-0" />
          <h3 className="text-base font-bold text-white tracking-tight truncate">
            Live Platform Operations Timeline
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-copper-500/10 text-copper-400 border border-copper-500/20 shrink-0">
          IMMUTABLE LOG
        </span>
      </div>

      {/* Scrollable Body with Timeline Bar */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar relative pl-4 space-y-3.5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-graphite-800 pr-1">
        {events.map((e, idx) => (
          <div key={idx} className="relative flex items-center justify-between text-xs font-mono">
            <div className={`absolute -left-4 w-2 h-2 rounded-full ${e.color}`} />
            <span className="text-white truncate pr-2">{e.title}</span>
            <span className="text-graphite-500 text-[10px] shrink-0">{e.time}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-graphite-800 pt-3 mt-3 flex items-center justify-between text-xs text-graphite-400 select-none shrink-0">
        <span className="font-mono text-[11px]">Real-time WebSocket event ledger</span>
        <Link
          href="/notifications"
          className="text-copper-400 font-semibold hover:underline flex items-center space-x-1"
        >
          <span>Audit Log Stream</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
