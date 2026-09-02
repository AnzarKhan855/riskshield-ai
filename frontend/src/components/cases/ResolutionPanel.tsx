"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, AlertOctagon, Lock, ShieldCheck } from "lucide-react";
import { useResolveCase, useCloseCase } from "@/hooks/useCases";
import { useToast } from "@/components/ui/toast";

interface ResolutionPanelProps {
  caseId: string;
  currentStatus: string;
  currentResolution?: string;
}

export default function ResolutionPanel({
  caseId,
  currentStatus,
  currentResolution,
}: ResolutionPanelProps) {
  const [notes, setNotes] = useState("");
  const resolveMutation = useResolveCase();
  const closeMutation = useCloseCase();
  const { showToast } = useToast();

  const handleResolve = (resType: "APPROVE" | "REJECT" | "ESCALATE" | "CLOSE") => {
    if (resType === "CLOSE") {
      closeMutation.mutate(caseId);
      return;
    }

    if (!notes.trim()) {
      showToast("Please provide resolution justification notes.", "warning");
      return;
    }

    resolveMutation.mutate({
      id: caseId,
      values: {
        resolution: resType,
        resolution_notes: notes,
      },
    });
  };

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
        <ShieldCheck className="w-5 h-5 text-copper-400" />
        <h3 className="text-sm font-semibold text-white">Analyst Case Resolution Panel</h3>
      </div>

      {currentResolution ? (
        <div className="p-4 rounded-lg bg-graphite-950 border border-graphite-800 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-copper-400">Final Case Resolution</span>
          <p className="text-sm font-bold font-mono text-white">{currentResolution}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-graphite-300">
              Resolution Justification Notes *
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="State explicit rationale for case resolution (e.g., Customer identity verified via passport)..."
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleResolve("APPROVE")}
              disabled={resolveMutation.isPending}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve (Allow Txn)</span>
            </button>

            <button
              onClick={() => handleResolve("REJECT")}
              disabled={resolveMutation.isPending}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject (Confirm Block)</span>
            </button>

            <button
              onClick={() => handleResolve("ESCALATE")}
              disabled={resolveMutation.isPending}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Escalate to Compliance</span>
            </button>

            <button
              onClick={() => handleResolve("CLOSE")}
              disabled={closeMutation.isPending}
              className="px-4 py-2 bg-graphite-800 hover:bg-graphite-700 text-graphite-300 font-bold text-xs rounded-lg border border-graphite-700 transition-colors flex items-center space-x-1.5"
            >
              <Lock className="w-4 h-4" />
              <span>Close Case</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
