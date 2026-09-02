"use client";

import React, { useState } from "react";
import { UserCheck, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ReviewerPanelProps {
  decisionId: string;
  currentStatus: string;
  reviewerId?: string;
}

export default function ReviewerPanel({
  decisionId,
  currentStatus,
  reviewerId,
}: ReviewerPanelProps) {
  const [overrideNote, setOverrideNote] = useState("");
  const [statusState, setStatusState] = useState(currentStatus || "NONE");
  const { showToast } = useToast();

  const handleAction = (actionType: "APPROVE_OVERRIDE" | "REJECT_OVERRIDE") => {
    setStatusState(actionType);
    showToast(
      `Decision ${decisionId} override status set to ${actionType.replace("_", " ")}!`,
      "success"
    );
  };

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
        <UserCheck className="w-5 h-5 text-copper-400" />
        <h3 className="text-sm font-semibold text-white">Risk Analyst Reviewer Panel</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-graphite-400 font-medium">Review Status:</span>
          <p className="font-mono font-bold text-copper-400 text-sm mt-0.5">{statusState}</p>
        </div>

        <div>
          <span className="text-graphite-400 font-medium">Reviewer Assignment:</span>
          <p className="font-mono text-graphite-200 mt-0.5">
            {reviewerId || "Automated System Rule Engine"}
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <label className="block text-xs font-semibold text-graphite-300">
          Analyst Review Notes / Justification
        </label>
        <textarea
          rows={2}
          value={overrideNote}
          onChange={(e) => setOverrideNote(e.target.value)}
          placeholder="Add manual risk assessment notes or override justification..."
          className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
        />
      </div>

      <div className="flex items-center space-x-3 pt-2">
        <button
          onClick={() => handleAction("APPROVE_OVERRIDE")}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Approve Override</span>
        </button>

        <button
          onClick={() => handleAction("REJECT_OVERRIDE")}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
        >
          <XCircle className="w-4 h-4" />
          <span>Reject / Confirm Block</span>
        </button>
      </div>
    </div>
  );
}
