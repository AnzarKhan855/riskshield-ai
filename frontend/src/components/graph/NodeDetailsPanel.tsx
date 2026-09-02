"use client";

import React from "react";
import { GraphNodeRecord, GraphEdgeRecord } from "@/types/graph";
import { X, Network, ShieldAlert, Cpu, ArrowRight, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface NodeDetailsPanelProps {
  node: GraphNodeRecord | null;
  edges: GraphEdgeRecord[];
  onClose: () => void;
  onExpandNode: (nodeId: string) => void;
}

export default function NodeDetailsPanel({
  node,
  edges,
  onClose,
  onExpandNode,
}: NodeDetailsPanelProps) {
  if (!node) return null;

  const connectedEdges = edges.filter((e) => e.source === node.id || e.target === node.id);
  const lvl = node.risk_level.toUpperCase();

  return (
    <div className="w-80 bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-xl space-y-5 flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-140px)]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-graphite-800 pb-3">
          <div className="flex items-center space-x-2">
            <Network className="w-4 h-4 text-copper-400" />
            <h3 className="text-sm font-bold text-white">Entity Inspection Panel</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded bg-graphite-800 hover:bg-graphite-700 text-graphite-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Node Overview Card */}
        <div className="bg-graphite-950 border border-graphite-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded bg-graphite-800 text-copper-400 font-mono text-[10px] font-bold">
              {node.type}
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded font-mono text-[10px] font-bold border",
                lvl === "CRITICAL"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : lvl === "HIGH"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              )}
            >
              {lvl} RISK
            </span>
          </div>

          <h4 className="text-sm font-bold text-white truncate">{node.label}</h4>
          <p className="font-mono text-xs text-copper-400">{node.id}</p>

          <div className="pt-2 flex items-center justify-between border-t border-graphite-800/60 text-xs">
            <span className="text-graphite-400">Risk Score Rating:</span>
            <span className="font-mono font-extrabold text-white">{node.risk_score.toFixed(1)} / 100</span>
          </div>
        </div>

        {/* Node Metadata JSON */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-graphite-400">Entity Attributes & Metadata</span>
          <pre className="p-3 rounded-lg bg-graphite-950 border border-graphite-800 font-mono text-[11px] text-graphite-300 overflow-x-auto max-h-48 leading-relaxed">
            {JSON.stringify(node.metadata, null, 2)}
          </pre>
        </div>

        {/* Connected Edges */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-graphite-400">
            Connected Relationships ({connectedEdges.length})
          </span>

          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {connectedEdges.map((e) => {
              const otherId = e.source === node.id ? e.target : e.source;
              return (
                <div
                  key={e.id}
                  className="bg-graphite-950 border border-graphite-800/80 rounded p-2 text-[11px] font-mono flex items-center justify-between"
                >
                  <span className="text-copper-400 font-bold">{e.relationship}</span>
                  <span className="text-graphite-300 truncate max-w-[120px]">{otherId}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expand Node Action */}
      <button
        onClick={() => onExpandNode(node.id)}
        className="w-full mt-4 py-2 bg-copper-500 hover:bg-copper-400 text-graphite-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5"
      >
        <Network className="w-3.5 h-3.5" />
        <span>Expand Relationships (1-Hop)</span>
      </button>
    </div>
  );
}
