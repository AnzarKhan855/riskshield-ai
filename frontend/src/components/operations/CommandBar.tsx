"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  ShieldCheck,
  Clock,
  Search,
  RefreshCw,
  Layers,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  Zap,
  DollarSign,
  Cpu,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

interface CommandBarProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export default function CommandBar({ onRefresh, isLoading }: CommandBarProps) {
  const { user } = useAuthStore();
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(new Date().toUTCString().replace("GMT", "UTC"));
    }, 1000);
    setUtcTime(new Date().toUTCString().replace("GMT", "UTC"));
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full">
      {/* Top Real-Time Ticker Banner */}
      <div className="bg-gradient-to-r from-graphite-900 via-graphite-950 to-graphite-900 border border-graphite-800 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Platform Status & Mesh */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-bold text-emerald-400 text-xs tracking-wide">SYSTEM OPERATIONAL 99.999%</span>
          </div>

          <div className="hidden lg:flex items-center space-x-2 text-graphite-400 font-mono text-xs bg-graphite-900 px-3.5 py-2 rounded-xl border border-graphite-800">
            <Cpu className="w-3.5 h-3.5 text-copper-400" />
            <span>Ensemble: <strong className="text-emerald-400">4 / 4 Active</strong></span>
          </div>
        </div>

        {/* Real-Time Financial Velocity Badges */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-graphite-900 px-3.5 py-2 rounded-xl border border-graphite-800 font-mono">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-graphite-400">Prevented: <strong className="text-white">$482,900.00</strong></span>
          </div>

          <div className="flex items-center space-x-2 bg-graphite-900 px-3.5 py-2 rounded-xl border border-graphite-800 font-mono">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-graphite-400">Chargeback Ratio: <strong className="text-emerald-400 font-bold">0.18%</strong> (Visa Limit: 0.90%)</span>
          </div>
        </div>

        {/* Global Controls & UTC Clock */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-graphite-900 px-3.5 py-2 rounded-xl border border-graphite-800 font-mono text-copper-400 text-xs shadow-inner">
            <Clock className="w-3.5 h-3.5 text-copper-400" />
            <span>{utcTime || "00:00:00 UTC"}</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-graphite-900 border border-graphite-700 hover:border-copper-400/50 hover:bg-graphite-800 text-copper-400 transition-all disabled:opacity-50 shadow-sm"
            title="Refresh Live Operations Streams"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
