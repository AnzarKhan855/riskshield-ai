"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, ShieldX, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DecisionBadgeProps {
  action: string;
  size?: "sm" | "md" | "lg";
}

export default function DecisionBadge({ action, size = "md" }: DecisionBadgeProps) {
  const act = action.toUpperCase();

  let colors = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  let icon = <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />;

  if (act === "BLOCK") {
    colors = "bg-rose-500/10 text-rose-400 border-rose-500/30";
    icon = <ShieldX className="w-3.5 h-3.5 mr-1 text-rose-400" />;
  } else if (act === "ESCALATE") {
    colors = "bg-purple-500/10 text-purple-400 border-purple-500/30";
    icon = <AlertOctagon className="w-3.5 h-3.5 mr-1 text-purple-400" />;
  } else if (act === "REVIEW") {
    colors = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    icon = <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" />;
  }

  const py = size === "lg" ? "py-1 px-3 text-xs" : size === "sm" ? "py-0.5 px-2 text-[10px]" : "py-0.5 px-2.5 text-xs";

  return (
    <span className={cn("inline-flex items-center font-bold font-mono rounded-full border", colors, py)}>
      {icon}
      {act}
    </span>
  );
}
