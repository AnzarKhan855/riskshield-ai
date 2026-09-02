"use client";

import React from "react";
import { EventLogRecord } from "@/types/notification";
import { Activity, ShieldAlert, Cpu, Layers, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventTimelineProps {
  events: EventLogRecord[];
  isLoading: boolean;
}

export default function EventTimeline({ events, isLoading }: EventTimelineProps) {
  if (isLoading) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 space-y-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-graphite-800/60 rounded-lg w-full" />
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-8 text-center text-xs text-graphite-400">
        No platform events recorded yet.
      </div>
    );
  }

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
        <Activity className="w-5 h-5 text-copper-400" />
        <h3 className="text-sm font-semibold text-white">Real-Time Platform Event Stream</h3>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-graphite-800">
        {events.map((evt) => (
          <div key={evt.id} className="relative group">
            <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-graphite-900 border-2 border-copper-400 group-hover:border-emerald-400 transition-colors" />

            <div className="bg-graphite-950 border border-graphite-800 rounded-lg p-3.5 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-copper-400 font-mono">{evt.event_id}</span>
                <span className="text-[10px] font-mono text-graphite-400">
                  {new Date(evt.created_at).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-graphite-800 text-white font-mono text-[10px] font-bold">
                  {evt.event_type}
                </span>
                <span className="text-graphite-400 font-mono text-[11px]">Source: {evt.source}</span>
              </div>

              <div className="pt-1 text-[11px] text-graphite-300 font-mono truncate max-w-lg">
                {JSON.stringify(evt.payload)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
