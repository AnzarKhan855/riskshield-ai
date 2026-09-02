"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import ExplanationTable from "@/components/explanations/ExplanationTable";
import { useExplanations } from "@/hooks/useExplanations";
import { ExplanationFilterParams } from "@/types/explanation";
import { Cpu, Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ExplanationsDirectoryPage() {
  const [filters, setFilters] = useState<ExplanationFilterParams>({
    page: 1,
    size: 10,
    search: "",
  });

  const { data, isLoading } = useExplanations(filters);
  const { showToast } = useToast();

  const handleFilterChange = (newFilters: Partial<ExplanationFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleExportCsv = () => {
    if (!data?.items || data.items.length === 0) return;
    const headers = ["Explanation ID", "Decision ID", "Transaction ID", "Composite Risk Score", "Confidence", "Primary Rationale", "Created At"];
    const rows = data.items.map((e) => [
      e.explanation_id,
      e.decision_id,
      e.transaction_id,
      e.composite_risk_score.toFixed(1),
      `${e.confidence_score.toFixed(1)}%`,
      `"${e.primary_reason}"`,
      e.created_at,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RiskShield_AI_Explanations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV export generated successfully!", "info");
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400 mb-1">
                <Cpu className="w-4 h-4 text-copper-400" />
                <span>Enterprise Explainable AI Platform</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                AI Explainability & Audit Center
              </h1>
              <p className="text-xs text-graphite-400 mt-1">
                Audit feature importance attributions, model ensemble weights, and cryptographic rationale hashes.
              </p>
            </div>

            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 bg-graphite-900 border border-graphite-800 hover:bg-graphite-800 text-copper-400 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit CSV</span>
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-graphite-400">Total Explanations Audited</span>
              <p className="text-2xl font-bold text-white font-mono mt-1">{data?.total || 0}</p>
            </div>

            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Avg Prediction Confidence</span>
              <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">95.4%</p>
            </div>

            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-copper-400">Audit Compliance Standard</span>
              <p className="text-lg font-bold text-copper-400 font-mono mt-1">PCI-DSS v4.0 / SOC2</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 shadow-sm">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search explanations by ID, decision, or transaction..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange({ search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-graphite-100 text-xs placeholder-graphite-500 focus:outline-none focus:ring-2 focus:ring-copper-400"
              />
              <Search className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Data Table */}
          <ExplanationTable items={data?.items || []} isLoading={isLoading} />

          {/* Pagination Controls */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-between bg-graphite-900 border border-graphite-800 rounded-xl px-4 py-3 text-xs text-graphite-400">
              <div>
                Page <span className="font-semibold text-white">{data.page}</span> of{" "}
                <span className="font-semibold text-white">{data.pages}</span> ({data.total} total explanations)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  disabled={data.page <= 1}
                  onClick={() => handleFilterChange({ page: data.page - 1 })}
                  className="p-1.5 rounded-lg bg-graphite-800 hover:bg-graphite-700 disabled:opacity-40 text-graphite-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={data.page >= data.pages}
                  onClick={() => handleFilterChange({ page: data.page + 1 })}
                  className="p-1.5 rounded-lg bg-graphite-800 hover:bg-graphite-700 disabled:opacity-40 text-graphite-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
