"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  Trash2,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  AlertTriangle,
  Download,
  CheckSquare,
  Square,
  ArrowUpDown,
  X,
  Globe,
  Monitor,
  MapPin,
  FileText,
  Sparkles,
  Layers,
} from "lucide-react";
import { Transaction } from "@/types/transaction";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  onDeleteClick: (transaction: Transaction) => void;
  onRefresh?: () => void;
}

export default function TransactionTable({
  transactions,
  isLoading,
  onDeleteClick,
  onRefresh,
}: TransactionTableProps) {
  const { showToast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDrawerTxn, setActiveDrawerTxn] = useState<Transaction | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"timestamp" | "amount" | "fee">("timestamp");
  const [sortAsc, setSortAsc] = useState(false);

  // Filter & Sort Logic
  const filteredTransactions = transactions
    .filter((t) => (statusFilter === "ALL" ? true : t.status.toUpperCase() === statusFilter.toUpperCase()))
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === "timestamp") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

  // Selection Logic
  const handleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map((t) => t.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // CSV Export
  const handleExportCsv = (dataToExport?: Transaction[]) => {
    const data = dataToExport || (selectedIds.length > 0 ? filteredTransactions.filter((t) => selectedIds.includes(t.id)) : filteredTransactions);
    if (data.length === 0) {
      showToast("No transaction records available to export.", "warning");
      return;
    }

    const headers = ["Transaction_ID", "Reference", "Amount", "Currency", "Net_Amount", "Fee", "Status", "Payment_Method", "Card_Network", "Country", "Timestamp"];
    const rows = data.map((t) => [
      t.transaction_id,
      t.reference_number || "",
      t.amount.toFixed(2),
      t.currency,
      t.net_amount.toFixed(2),
      t.fee.toFixed(2),
      t.status,
      t.payment_method,
      t.card_network || "",
      t.country || "",
      t.timestamp,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RiskShield_Transactions_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${data.length} transaction records to CSV!`, "success");
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
          showToast("Refreshed transaction ledger.", "info");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, filteredTransactions, onRefresh]);


  // Statistics
  const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0);
  const successCount = transactions.filter((t) => t.status === "Success").length;
  const chargebackCount = transactions.filter((t) => t.status === "Chargeback" || t.status === "Failed").length;
  const avgAmount = transactions.length > 0 ? (totalVolume / transactions.length).toFixed(2) : "0.00";

  return (
    <div className="space-y-4">
      {/* Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-graphite-900 border border-graphite-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-graphite-400 font-semibold">Total Volume</span>
          <p className="text-xl font-mono font-extrabold text-white mt-1">${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-graphite-900 border border-graphite-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">Success Rate</span>
          <p className="text-xl font-mono font-extrabold text-emerald-400 mt-1">
            {transactions.length > 0 ? ((successCount / transactions.length) * 100).toFixed(1) : 0}%
          </p>
        </div>

        <div className="bg-graphite-900 border border-graphite-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-rose-400 font-semibold">Dispute / Failed</span>
          <p className="text-xl font-mono font-extrabold text-rose-400 mt-1">{chargebackCount}</p>
        </div>

        <div className="bg-graphite-900 border border-graphite-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-copper-400 font-semibold">Average Ticket</span>
          <p className="text-xl font-mono font-extrabold text-copper-400 mt-1">${avgAmount}</p>
        </div>
      </div>

      {/* Filter Toolbar & Bulk Actions */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1.5 bg-graphite-950 p-1 rounded-xl border border-graphite-800 text-xs">
          {["ALL", "SUCCESS", "PROCESSING", "FAILED", "CHARGEBACK"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === tab
                  ? "bg-copper-500 text-graphite-950 shadow-sm"
                  : "text-graphite-400 hover:text-white hover:bg-graphite-850"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-2 bg-copper-500/10 border border-copper-500/30 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-copper-300 font-mono font-bold">{selectedIds.length} Selected</span>
              <button
                onClick={() => {
                  showToast(`Flagged ${selectedIds.length} transactions for manual review!`, "warning");
                  setSelectedIds([]);
                }}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold rounded-lg transition-colors"
              >
                Flag Review
              </button>
            </div>
          )}

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

      {/* Main Table */}
      {isLoading ? (
        <div className="bg-graphite-900 border border-graphite-800 rounded-2xl overflow-hidden shadow-sm p-6 space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-graphite-800/50 rounded-xl w-full" />
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-graphite-800 text-copper-400 flex items-center justify-center mx-auto shadow-inner">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Matching Transactions</h3>
          <p className="text-xs text-graphite-400 max-w-sm mx-auto">
            No transactions match the filter status ({statusFilter}). Clear filters or ingest new payment events.
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
                      {selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-copper-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-5 py-4">Transaction ID & Ref</th>
                  <th className="px-5 py-4">Payment Method</th>
                  <th className="px-5 py-4 cursor-pointer hover:text-white" onClick={() => { setSortField("amount"); setSortAsc(!sortAsc); }}>
                    <div className="flex items-center space-x-1">
                      <span>Amount & Net</span>
                      <ArrowUpDown className="w-3 h-3 text-graphite-500" />
                    </div>
                  </th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Geo / Environment</th>
                  <th className="px-5 py-4 cursor-pointer hover:text-white" onClick={() => { setSortField("timestamp"); setSortAsc(!sortAsc); }}>
                    <div className="flex items-center space-x-1">
                      <span>Timestamp</span>
                      <ArrowUpDown className="w-3 h-3 text-graphite-500" />
                    </div>
                  </th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-800/60">
                {filteredTransactions.map((txn) => {
                  const isSelected = selectedIds.includes(txn.id);
                  return (
                    <tr key={txn.id} className={`hover:bg-graphite-800/40 transition-colors ${isSelected ? "bg-copper-500/5" : ""}`}>
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => handleToggleSelect(txn.id)} className="p-1 text-graphite-400 hover:text-white">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-copper-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs font-mono text-copper-400">{txn.transaction_id}</span>
                          <span className="text-[11px] text-graphite-400 mt-0.5">
                            {txn.reference_number || "No Ref"} &bull; Cust: {txn.customer_id || "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-lg bg-graphite-950 border border-graphite-800 text-copper-400">
                            <CreditCard className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{txn.payment_method}</span>
                            <span className="text-[10px] font-mono text-graphite-400">{txn.card_network || "Generic"}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col font-mono">
                          <span className="font-bold text-xs text-white">${txn.amount.toFixed(2)} <span className="text-[10px] text-graphite-400">{txn.currency}</span></span>
                          <span className="text-[10px] text-emerald-400">Net: ${txn.net_amount.toFixed(2)}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border font-mono",
                            txn.status === "Success" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                            txn.status === "Processing" && "bg-amber-500/10 border-amber-500/30 text-amber-400",
                            (txn.status === "Failed" || txn.status === "Chargeback") && "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          )}
                        >
                          {txn.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col text-[11px] font-mono text-graphite-300">
                          <span>{txn.country || "US"} &bull; {txn.device_type || "Desktop"}</span>
                          <span className="text-[10px] text-graphite-500">{txn.ip_address || "127.0.0.1"}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-graphite-400 text-[11px] font-mono">
                        {new Date(txn.timestamp).toLocaleTimeString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setActiveDrawerTxn(txn)}
                            className="px-2.5 py-1.5 rounded-lg bg-graphite-950 border border-graphite-700 hover:border-copper-400 hover:text-copper-400 text-graphite-300 transition-colors text-xs font-semibold flex items-center space-x-1"
                            title="Quick Slide-over Inspector"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>

                          <Link
                            href={`/transactions/${txn.transaction_id}`}
                            className="p-1.5 rounded-lg bg-graphite-950 border border-graphite-700 hover:bg-graphite-800 text-graphite-400 hover:text-white transition-colors"
                            title="Open Full Transaction Detail"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => onDeleteClick(txn)}
                            className="p-1.5 rounded-lg bg-graphite-950 border border-graphite-700 hover:bg-rose-950/40 text-graphite-400 hover:text-rose-400 transition-colors"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Slide-Over Transaction Forensic Drawer */}
      {activeDrawerTxn && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="bg-graphite-900 border-l border-graphite-700 w-full max-w-xl h-full overflow-y-auto custom-scrollbar p-6 space-y-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-graphite-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-copper-500/10 text-copper-400 border border-copper-500/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">{activeDrawerTxn.transaction_id}</h3>
                  <p className="text-xs text-graphite-400 font-mono">Reference: {activeDrawerTxn.reference_number || "No Ref"}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveDrawerTxn(null)}
                className="p-2 rounded-xl bg-graphite-950 border border-graphite-800 text-graphite-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-graphite-950 p-4 rounded-xl border border-graphite-800">
                <span className="text-[10px] font-mono uppercase text-graphite-400 font-semibold">Gross Amount</span>
                <p className="text-2xl font-mono font-extrabold text-white mt-1">
                  ${activeDrawerTxn.amount.toFixed(2)} <span className="text-xs text-graphite-400">{activeDrawerTxn.currency}</span>
                </p>
              </div>

              <div className="bg-graphite-950 p-4 rounded-xl border border-graphite-800">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">Net Settlement</span>
                <p className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
                  ${activeDrawerTxn.net_amount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Telemetry & Device Details */}
            <div className="bg-graphite-950 p-4 rounded-xl border border-graphite-800 space-y-3">
              <span className="text-[10px] font-mono uppercase text-copper-400 font-bold">Device & Geo Fingerprint</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-graphite-500 font-mono">IP Address:</span>
                  <p className="font-mono text-graphite-200">{activeDrawerTxn.ip_address || "127.0.0.1"}</p>
                </div>
                <div>
                  <span className="text-graphite-500 font-mono">Country / Region:</span>
                  <p className="font-mono text-graphite-200">{activeDrawerTxn.country || "US"}</p>
                </div>
                <div>
                  <span className="text-graphite-500 font-mono">Device Type:</span>
                  <p className="font-mono text-graphite-200">{activeDrawerTxn.device_type || "Desktop"}</p>
                </div>
                <div>
                  <span className="text-graphite-500 font-mono">Operating System:</span>
                  <p className="font-mono text-graphite-200">{activeDrawerTxn.operating_system || "Windows"}</p>
                </div>
              </div>
            </div>

            {/* Quick AI Workflow Jump */}
            <div className="bg-graphite-950 p-4 rounded-xl border border-graphite-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-copper-400 font-bold">Cross-Module AI Actions</span>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <a
                  href={`/features/${activeDrawerTxn.transaction_id}`}
                  className="p-2.5 rounded-lg bg-graphite-900 border border-graphite-800 hover:border-copper-400 text-white font-semibold text-center block"
                >
                  Feature Store Vector ➔
                </a>
                <a
                  href={`/decisions`}
                  className="p-2.5 rounded-lg bg-graphite-900 border border-graphite-800 hover:border-copper-400 text-white font-semibold text-center block"
                >
                  Evaluate Decision ➔
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-graphite-800 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(activeDrawerTxn, null, 2));
                  showToast("Copied transaction JSON payload!", "info");
                }}
                className="px-4 py-2 bg-graphite-950 border border-graphite-700 text-graphite-200 text-xs font-semibold rounded-xl hover:bg-graphite-800"
              >
                Copy JSON
              </button>

              <Link
                href={`/transactions/${activeDrawerTxn.transaction_id}`}
                className="px-4 py-2 bg-copper-500 hover:bg-copper-400 text-graphite-950 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
              >
                <span>Edit & Full Dossier</span>
                <Sparkles className="w-3.5 h-3.5 fill-graphite-950" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
