"use client";

import React from "react";
import { Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function GeoRiskHeatmapCard() {
  const regions = [
    { country: "India", txns: 12450, risk: "MEDIUM", flag: "🇮🇳" },
    { country: "United States", txns: 9820, risk: "LOW", flag: "🇺🇸" },
    { country: "United Kingdom", txns: 4510, risk: "LOW", flag: "🇬🇧" },
    { country: "Russia", txns: 1420, risk: "HIGH", flag: "🇷🇺" },
    { country: "Nigeria", txns: 980, risk: "CRITICAL", flag: "🇳🇬" },
    { country: "Singapore", txns: 3200, risk: "LOW", flag: "🇸🇬" },
    { country: "Brazil", txns: 1890, risk: "MEDIUM", flag: "🇧🇷" },
  ];

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-sm hover:border-graphite-700/60 transition-all flex flex-col h-[420px] w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-graphite-800 pb-4 mb-4 select-none shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <Globe className="w-4 h-4 text-copper-400 shrink-0" />
          <h3 className="text-base font-bold text-white tracking-tight truncate">
            Geographic Risk Heatmap
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-copper-500/10 text-copper-400 border border-copper-500/20 shrink-0">
          GLOBAL MESH
        </span>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
        {regions.map((r) => (
          <div
            key={r.country}
            className="bg-graphite-950 border border-graphite-800/80 rounded-xl p-3 flex items-center justify-between text-xs hover:border-graphite-700 transition-colors"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <span className="text-base">{r.flag}</span>
              <span className="font-semibold text-white truncate">{r.country}</span>
            </div>

            <div className="flex items-center space-x-3 shrink-0 font-mono text-[11px]">
              <span className="text-graphite-400">{r.txns.toLocaleString()} txns</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold font-mono border",
                  r.risk === "CRITICAL"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    : r.risk === "HIGH"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : r.risk === "MEDIUM"
                    ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                )}
              >
                {r.risk}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-graphite-800 pt-3 mt-3 flex items-center justify-between text-xs text-graphite-400 select-none shrink-0">
        <span className="font-mono text-[11px]">7 active audited jurisdictions</span>
        <Link
          href="/graph"
          className="text-copper-400 font-semibold hover:underline flex items-center space-x-1"
        >
          <span>Graph Intelligence</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
