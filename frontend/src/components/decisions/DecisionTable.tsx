"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  ShieldCheck,
  Cpu,
  Download,
  CheckSquare,
  Square,
  SlidersHorizontal,
  ArrowUpDown,
  FileText,
  X,
  Code,
  TrendingUp,
  Layers,
  Lock,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Zap,
} from "lucide-react";
import { DecisionRecord } from "@/types/decision";
import DecisionBadge from "./DecisionBadge";
import { useToast } from "@/components/ui/toast";

interface DecisionTableProps {
  decisions: DecisionRecord[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export default function DecisionTable({ decisions, isLoading, onRefresh }: DecisionTableProps) {
  const { showToast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDrawerRecord, setActiveDrawerRecord] = useState<DecisionRecord | null>(null);
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"created_at" | "composite_risk_score" | "execution_time_ms">("created_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Filter & Sort Logic
  const filteredDecisions = decisions
    .filter((d) => (actionFilter === "ALL" ? true : d.decision.toUpperCase() === actionFilter.toUpperCase()))
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") valA = new Date(valA).getTime();
      if (typeof valB === "string") valB = new Date(valB).getTime();
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

  // Selection Logic
  const handleSelectAll = () => {
    if (selectedIds.length === filteredDecisions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDecisions.map((d) => d.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // CSV Export
  const handleExportCsv = (recordsToExport?: DecisionRecord[]) => {
    const data = recordsToExport || (selectedIds.length > 0 ? filteredDecisions.filter((d) => selectedIds.includes(d.id)) : filteredDecisions);
    if (data.length === 0) {
      showToast("No records available to export.", "warning");
      return;
    }

    const headers = ["Decision_ID", "Transaction_ID", "Decision", "Risk_Score", "Confidence", "Latency_MS", "Rules_Count", "Created_At"];
    const rows = data.map((d) => [
      d.decision_id,
      d.transaction_id,
      d.decision,
      d.composite_risk_score.toFixed(2),
      (d.decision_confidence * 100).toFixed(1) + "%",
      d.execution_time_ms,
      d.triggered_rules?.length || 0,
      d.created_at,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RiskShield_Decisions_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${data.length} decision records to CSV!`, "success");
  };

  // Bulk Actions
  const handleBulkApprove = () => {
    showToast(`Bulk Approved ${selectedIds.length} decision records!`, "success");
    setSelectedIds([]);
  };

  const handleBulkBlock = () => {
    showToast(`Bulk Blocked & Escalated ${selectedIds.length} decisions!`, "warning");
    setSelectedIds([]);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        handleExportCsv();
      } else if (e.key === "r" || e.key === "R") {
        if (onRefresh) {
          e.preventDefault();
          onRefresh();
          showToast("Refreshed decision streams.", "info");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, filteredDecisions, onRefresh]);


  // Statistics Summary
  const totalCount = decisions.length;
  const approveCount = decisions.filter((d) => d.decision === "APPROVE").length;
  const blockCount = decisions.filter((d) => d.decision === "BLOCK").length;
  const reviewCount = decisions.filter((d) => d.decision === "REVIEW").length;
  const avgLatency = totalCount > 0 ? (decisions.reduce((acc, cur) => acc + cur.execution_time_ms, 0) / totalCount).toFixed(1) : "0";

  return (
    <div className="space-y-4">
      {/* Real-time Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-graphite-900 border border-graphite-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-graphite-400 font-semibold">Total Evaluated</span>
          <p className="text-xl font-mono font-extrabold text-white mt-1">{totalCount}</p>
        </div>

        <div className="bg-graphite-900 border border-graphite-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">Approve Rate</span>
          <p className="text-xl font-mono font-extrabold text-emerald-400 mt-1">
            {totalCount > 0 ? ((approveCount / totalCount) * 100).toFixed(1) : 0}%
          </p>
        </div>

        <div className="bg-graphite-900 border border-graphite-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-rose-400 font-semibold">Block Rate</span>
          <p className="text-xl font-mono font-extrabold text-rose-400 mt-1">
            {totalCount > 0 ? ((blockCount / totalCount) * 100).toFixed(1) : 0}%
          </p>
        </div>

        <div className="bg-graphite-900 border border-graphite-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold">Review Rate</span>
          <p className="text-xl font-mono font-extrabold text-amber-400 mt-1">
            {totalCount > 0 ? ((reviewCount / totalCount) * 100).toFixed(1) : 0}%
          </p>
        </div>

        <div className="bg-graphite-900 border border-graphite-800 p-3.5 rounded-xl col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono uppercase text-sky-400 font-semibold">Mean Latency</span>
          <p className="text-xl font-mono font-extrabold text-sky-400 mt-1">{avgLatency} ms</p>
        </div>
      </div>

      {/* Advanced Filter Toolbar & Bulk Actions */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Action Tabs */}
        <div className="flex items-center space-x-1.5 bg-graphite-950 p-1 rounded-xl border border-graphite-800 text-xs">
          {["ALL", "APPROVE", "REVIEW", "BLOCK"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActionFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                actionFilter === tab
                  ? "bg-copper-500 text-graphite-950 shadow-sm"
                  : "text-graphite-400 hover:text-white hover:bg-graphite-850"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Bulk Action Controls */}
        <div className="flex items-center space-x-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-2 bg-copper-500/10 border border-copper-500/30 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-copper-300 font-mono font-bold">{selectedIds.length} Selected</span>
              <button
                onClick={handleBulkApprove}
                className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold rounded-lg transition-colors"
              >
                Approve
              </button>
              <button
                onClick={handleBulkBlock}
                className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold rounded-lg transition-colors"
              >
                Block
              </button>
            </div>
          )}

          {/* Export CSV Trigger */}
          <button
            onClick={() => handleExportCsv()}
            className="px-3.5 py-2 bg-graphite-950 border border-graphite-700 hover:border-copper-400/50 hover:bg-graphite-850 text-graphite-200 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 shadow-sm"
            title="Export to CSV (Press E)"
          >
            <Download className="w-3.5 h-3.5 text-copper-400" />
            <span>Export CSV</span>
            <kbd className="hidden sm:inline-block px-1 py-0.2 rounded bg-graphite-800 text-[10px] font-mono text-graphite-400 border border-graphite-700 ml-1">E</kbd>
          </button>
        </div>
      </div>

      {/* Main Table View */}
      {isLoading ? (
        <div className="bg-graphite-900 border border-graphite-800 rounded-2xl overflow-hidden shadow-sm p-6 space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-graphite-800/50 rounded-xl w-full" />
          ))}
        </div>
      ) : filteredDecisions.length === 0 ? (
        <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-graphite-800 text-copper-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Matching Decision Records</h3>
          <p className="text-xs text-graphite-400 max-w-sm mx-auto">
            No decision traces match the current filter criteria ({actionFilter}). Clear filters or evaluate new transactions.
          </p>
        </div>
      ) : (
        <div className="bg-graphite-900 border border-graphite-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-graphite-300">
              <thead className="bg-graphite-950/80 uppercase tracking-wider text-[10px] font-semibold text-copper-400 border-b border-graphite-800 select-none">
                <tr>
                  <th className="px-4 py-4 w-10 text-center">
                    <button onClick={handleSelectAll} className="p-1 text-graphite-400 hover:text-white">
                      {selectedIds.length === filteredDecisions.length && filteredDecisions.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-copper-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-5 py-4 cursor-pointer hover:text-white" onClick={() => { setSortField("created_at"); setSortAsc(!sortAsc); }}>
                    <div className="flex items-center space-x-1">
                      <span>Decision ID & Txn</span>
                      <ArrowUpDown className="w-3 h-3 text-graphite-500" />
                    </div>
                  </th>
                  <th className="px-5 py-4">Action</th>
                  <th className="px-5 py-4 cursor-pointer hover:text-white" onClick={() => { setSortField("composite_risk_score"); setSortAsc(!sortAsc); }}>
                    <div className="flex items-center space-x-1">
                      <span>Risk Score</span>
                      <ArrowUpDown className="w-3 h-3 text-graphite-500" />
                    </div>
                  </th>
                  <th className="px-5 py-4">Confidence</th>
                  <th className="px-5 py-4">Triggered Rules</th>
                  <th className="px-5 py-4 cursor-pointer hover:text-white" onClick={() => { setSortField("execution_time_ms"); setSortAsc(!sortAsc); }}>
                    <div className="flex items-center space-x-1">
                      <span>Latency</span>
                      <ArrowUpDown className="w-3 h-3 text-graphite-500" />
                    </div>
                  </th>
                  <th className="px-5 py-4">Timestamp</th>
                  <th className="px-5 py-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-800/60">
                {filteredDecisions.map((d) => {
                  const isSelected = selectedIds.includes(d.id);
                  return (
                    <tr
                      key={d.id}
                      className={`hover:bg-graphite-800/40 transition-colors ${
                        isSelected ? "bg-copper-500/5" : ""
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => handleToggleSelect(d.id)} className="p-1 text-graphite-400 hover:text-white">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-copper-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-copper-400">
                            {d.decision_id}
                          </span>
                          <span className="text-[11px] font-mono text-graphite-400 mt-0.5">
                            Txn: <Link href={`/transactions/${d.transaction_id}`} className="hover:text-white underline">{d.transaction_id}</Link>
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <DecisionBadge action={d.decision} />
                      </td>

                      <td className="px-5 py-4 font-mono font-extrabold text-white text-xs">
                        <span className={`px-2 py-0.5 rounded-md ${d.composite_risk_score >= 80 ? 'bg-rose-500/10 text-rose-400' : d.composite_risk_score >= 50 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {d.composite_risk_score.toFixed(1)}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-graphite-200">
                        {(d.decision_confidence * 100).toFixed(1)}%
                      </td>

                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded bg-graphite-800 font-mono text-[11px] text-copper-300 font-semibold border border-graphite-700">
                          {d.triggered_rules?.length || 0} Rules
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-sky-400">
                        {d.execution_time_ms} ms
                      </td>

                      <td className="px-5 py-4 text-graphite-400 text-[11px] font-mono">
                        {new Date(d.created_at).toLocaleTimeString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Slide-over Quick Drawer Trigger */}
                          <button
                            onClick={() => setActiveDrawerRecord(d)}
                            className="px-2.5 py-1.5 rounded-lg bg-graphite-950 border border-graphite-700 hover:border-copper-400 hover:text-copper-400 text-graphite-300 transition-colors text-xs font-semibold flex items-center space-x-1"
                            title="Quick Forensic Drawer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>

                          {/* Full Dossier Page Link */}
                          <Link
                            href={`/decisions/${d.decision_id}`}
                            className="p-1.5 rounded-lg bg-graphite-950 border border-graphite-700 hover:bg-graphite-800 text-graphite-400 hover:text-white transition-colors"
                            title="Open Full Forensic Dossier"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-Over Forensic Detail Drawer */}
      {activeDrawerRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="bg-graphite-900 border-l border-graphite-700 w-full max-w-xl h-full overflow-y-auto custom-scrollbar p-6 space-y-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-graphite-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-copper-500/10 text-copper-400 border border-copper-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">{activeDrawerRecord.decision_id}</h3>
                  <p className="text-xs text-graphite-400 font-mono">Transaction Ref: {activeDrawerRecord.transaction_id}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveDrawerRecord(null)}
                className="p-2 rounded-xl bg-graphite-950 border border-graphite-800 text-graphite-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Decision Status & Confidence */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-graphite-950 p-4 rounded-xl border border-graphite-800">
                <span className="text-[10px] font-mono uppercase text-graphite-400 font-semibold">Final Action</span>
                <div className="mt-2">
                  <DecisionBadge action={activeDrawerRecord.decision} size="lg" />
                </div>
              </div>

              <div className="bg-graphite-950 p-4 rounded-xl border border-graphite-800">
                <span className="text-[10px] font-mono uppercase text-graphite-400 font-semibold">Composite Risk Score</span>
                <p className="text-2xl font-mono font-extrabold text-white mt-1">
                  {activeDrawerRecord.composite_risk_score.toFixed(1)} <span className="text-xs text-graphite-500">/ 100</span>
                </p>
              </div>
            </div>

            {/* Decision Rationale */}
            <div className="bg-graphite-950 p-4 rounded-xl border border-graphite-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-copper-400 font-bold">Forensic Rationale</span>
              <p className="text-xs text-graphite-200 font-semibold leading-relaxed">{activeDrawerRecord.decision_reason}</p>
            </div>

            {/* Triggered Rules List */}
            <div className="bg-graphite-950 p-4 rounded-xl border border-graphite-800 space-y-3">
              <span className="text-[10px] font-mono uppercase text-copper-400 font-bold">Triggered Policy Rules ({activeDrawerRecord.triggered_rules?.length || 0})</span>
              {(activeDrawerRecord.triggered_rules || []).length === 0 ? (
                <p className="text-xs text-graphite-500 font-mono">No hard policy rules matched.</p>
              ) : (
                <div className="space-y-2">
                  {(activeDrawerRecord.triggered_rules || []).map((tr, idx) => (
                    <div key={idx} className="p-3 bg-graphite-900 rounded-lg border border-graphite-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white">{tr.rule_name}</span>
                        <p className="text-[10px] font-mono text-copper-400">{tr.rule_id} &bull; {tr.category}</p>
                      </div>
                      <span className="font-mono text-xs font-bold text-rose-400">{tr.severity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions & Navigation Footer */}
            <div className="pt-4 border-t border-graphite-800 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(activeDrawerRecord, null, 2));
                  setCopiedJson(true);
                  showToast("Copied decision trace JSON!", "info");
                  setTimeout(() => setCopiedJson(false), 2000);
                }}
                className="px-4 py-2 bg-graphite-950 border border-graphite-700 text-graphite-200 text-xs font-semibold rounded-xl hover:bg-graphite-800 flex items-center space-x-1.5 transition-colors"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? "Copied!" : "Copy Trace JSON"}</span>
              </button>

              <Link
                href={`/decisions/${activeDrawerRecord.decision_id}`}
                className="px-4 py-2 bg-copper-500 hover:bg-copper-400 text-graphite-950 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
              >
                <span>Open Full Forensic Dossier</span>
                <Sparkles className="w-3.5 h-3.5 fill-graphite-950" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
