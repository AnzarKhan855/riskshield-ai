"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import DecisionTable from "@/components/decisions/DecisionTable";
import { useDecisions, useEvaluateDecision } from "@/hooks/useDecisions";
import { DecisionFilterParams } from "@/types/decision";
import { ShieldCheck, Search, Play, ChevronLeft, ChevronRight, Cpu } from "lucide-react";
import Link from "next/link";

export default function DecisionsDirectoryPage() {
  const [filters, setFilters] = useState<DecisionFilterParams>({
    page: 1,
    size: 10,
    transaction_id: "",
  });

  const { data, isLoading } = useDecisions(filters);
  const evaluateMutation = useEvaluateDecision();
  const [txnInput, setTxnInput] = useState("TXN-ML-PRED-991");

  const handleFilterChange = (newFilters: Partial<DecisionFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleEvaluate = () => {
    if (txnInput) {
      evaluateMutation.mutate({ transaction_id: txnInput });
    }
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 w-full">
            <div className="min-w-0">
              <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400 mb-1">
                <ShieldCheck className="w-4 h-4 text-copper-400 shrink-0" />
                <span className="truncate">Enterprise Decision Intelligence Platform</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                Decision History & Evaluation Logs
              </h1>
              <p className="text-xs text-graphite-400 mt-1">
                Audit and trace automated risk decisions produced across business rules and compliance policies.
              </p>
            </div>

            <Link
              href="/rules"
              className="px-4 py-2.5 bg-copper-500 hover:bg-copper-400 text-graphite-950 font-bold text-xs rounded-lg transition-colors flex items-center space-x-2 shrink-0"
            >
              <Cpu className="w-4 h-4 fill-graphite-950" />
              <span>Open Rule Studio</span>
            </Link>
          </div>

          {/* Quick Evaluation Trigger Bar */}
          <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-3 sm:p-4 mb-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 w-full max-w-full">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto min-w-0">
              <input
                type="text"
                value={txnInput}
                onChange={(e) => setTxnInput(e.target.value)}
                placeholder="Target Transaction ID..."
                className="px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none w-full sm:w-72"
              />
              <button
                onClick={handleEvaluate}
                disabled={evaluateMutation.isPending}
                className="px-4 py-2 bg-graphite-800 hover:bg-graphite-700 text-copper-400 font-semibold text-xs rounded-lg border border-graphite-700 transition-colors flex items-center justify-center space-x-1.5 whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 fill-copper-400" />
                <span>{evaluateMutation.isPending ? "Evaluating..." : "Evaluate Decision"}</span>
              </button>
            </div>

            {/* Filter */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by Transaction ID..."
                value={filters.transaction_id || ""}
                onChange={(e) => handleFilterChange({ transaction_id: e.target.value, page: 1 })}
                className="w-full pl-9 pr-4 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-graphite-100 text-xs placeholder-graphite-500 focus:outline-none focus:ring-2 focus:ring-copper-400"
              />
              <Search className="w-3.5 h-3.5 text-graphite-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Data Table */}
          <DecisionTable decisions={data?.items || []} isLoading={isLoading} />

          {/* Pagination Controls */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-graphite-900 border border-graphite-800 rounded-xl px-4 py-3 text-xs text-graphite-400">
              <div>
                Page <span className="font-semibold text-white">{data.page}</span> of{" "}
                <span className="font-semibold text-white">{data.pages}</span> ({data.total} total decisions)
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
