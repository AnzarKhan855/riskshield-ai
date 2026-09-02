"use client";

import React from "react";
import { TimelineRecord } from "@/types/investigation";
import { Clock, Activity, CheckCircle2, UserCheck, ShieldAlert } from "lucide-react";

interface InvestigationTimelineProps {
  timelineList: TimelineRecord[];
}

export default function InvestigationTimeline({ timelineList }: InvestigationTimelineProps) {
  if (!timelineList || timelineList.length === 0) {
    return null;
  }

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
        <Clock className="w-5 h-5 text-copper-400" />
        <h3 className="text-sm font-semibold text-white">Investigation Activity Timeline</h3>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-graphite-800">
        {timelineList.map((item) => (
          <div key={item.id} className="relative flex items-start space-x-3">
            <div className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-copper-400 border-2 border-graphite-950" />
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-bold text-white uppercase font-mono">{item.action.replace("_", " ")}</span>
                <span className="text-graphite-400 font-mono">by {item.actor}</span>
                <span className="text-graphite-400 text-[10px]">
                  &bull; {new Date(item.created_at).toLocaleString()}
                </span>
              </div>

              {item.details && Object.keys(item.details).length > 0 && (
                <div className="text-[11px] font-mono text-graphite-300 bg-graphite-950 px-3 py-1.5 rounded border border-graphite-800 inline-block">
                  {JSON.stringify(item.details)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
