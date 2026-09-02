"use client";

import React from "react";
import { RecommendationRecord } from "@/types/explanation";
import { CheckCircle2, ShieldCheck, Lock, ArrowRight, FileCheck } from "lucide-react";

interface RecommendationPanelProps {
  recommendations: RecommendationRecord[];
  auditInfo: {
    audit_hash: string;
    engine_version: string;
    compliance_standard: string;
    audited_at: string;
    verifiable: boolean;
  };
}

export default function RecommendationPanel({
  recommendations,
  auditInfo,
}: RecommendationPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Analyst Recommendations Card */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-copper-400" />
          <h3 className="text-sm font-semibold text-white">Actionable Analyst Recommendations</h3>
        </div>

        <div className="space-y-3">
          {recommendations.map((r, idx) => (
            <div key={idx} className="bg-graphite-950 border border-graphite-800 rounded-lg p-3.5 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{r.title}</span>
                <span className="px-2 py-0.5 rounded bg-graphite-800 text-copper-400 font-mono text-[10px] font-bold">
                  {r.priority} PRIORITY
                </span>
              </div>
              <p className="text-graphite-300 text-[11px] font-sans">{r.rationale}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cryptographic Audit Verification Card */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4 font-mono">
        <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
          <FileCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Compliance Audit Information</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <span className="text-graphite-400 text-[10px]">Cryptographic SHA-256 Audit Hash:</span>
            <p className="p-2 rounded bg-graphite-950 border border-graphite-800 text-copper-400 text-[10px] break-all">
              {auditInfo.audit_hash}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-graphite-400">Explainability Engine:</span>
            <span className="text-white font-bold">{auditInfo.engine_version}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-graphite-400">Compliance Standard:</span>
            <span className="text-emerald-400 font-bold">{auditInfo.compliance_standard}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-graphite-400">Audit Status:</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>VERIFIED & AUDITABLE</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
