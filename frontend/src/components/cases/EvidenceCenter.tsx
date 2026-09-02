"use client";

import React from "react";
import { EvidenceRecord } from "@/types/investigation";
import { FolderGit2, ShieldAlert, Cpu, FileText, Database } from "lucide-react";

interface EvidenceCenterProps {
  evidenceList: EvidenceRecord[];
}

export default function EvidenceCenter({ evidenceList }: EvidenceCenterProps) {
  if (!evidenceList || evidenceList.length === 0) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-8 text-center space-y-2">
        <FolderGit2 className="w-8 h-8 text-copper-400 mx-auto" />
        <h4 className="text-sm font-bold text-white">No Evidence Discovered Yet</h4>
        <p className="text-xs text-graphite-400">
          Automated discovery is scanning backend intelligence services for linked evidence items.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
        <FolderGit2 className="w-5 h-5 text-copper-400" />
        <h3 className="text-sm font-semibold text-white">Evidence Center ({evidenceList.length} Items Attached)</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evidenceList.map((evd) => (
          <div
            key={evd.id}
            className="bg-graphite-950 border border-graphite-800 rounded-lg p-4 space-y-2 hover:border-copper-500/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-graphite-800 text-copper-400 font-mono text-[10px] font-bold uppercase">
                {evd.evidence_type}
              </span>
              <span className="font-mono text-[11px] text-graphite-400">{evd.evidence_id}</span>
            </div>

            <h4 className="text-xs font-bold text-white">{evd.title}</h4>
            {evd.description && <p className="text-[11px] text-graphite-300">{evd.description}</p>}

            {evd.metadata_json && Object.keys(evd.metadata_json).length > 0 && (
              <pre className="p-2.5 rounded bg-graphite-900 text-[10px] font-mono text-graphite-300 overflow-x-auto max-h-32 leading-tight">
                {JSON.stringify(evd.metadata_json, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
