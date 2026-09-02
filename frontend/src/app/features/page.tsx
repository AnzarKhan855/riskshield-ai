"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import FeatureVectorTable from "@/components/features/FeatureVectorTable";
import { useFeatures, useRecomputeFeatures } from "@/hooks/useFeatures";
import { FeatureFilterParams } from "@/types/feature";
import { Cpu, Search, Layers, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

export default function FeaturesRegistryPage() {
  const [filters, setFilters] = useState<FeatureFilterParams>({
    page: 1,
    size: 10,
    transaction_id: "",
  });

  const { data, isLoading } = useFeatures(filters);
  const recomputeMutation = useRecomputeFeatures();

  const handleFilterChange = (newFilters: Partial<FeatureFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleRecompute = (txnId: string) => {
    recomputeMutation.mutate(txnId);
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400 mb-1">
                <Cpu className="w-4 h-4 text-copper-400" />
                <span>Enterprise Feature Engineering Platform</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                ML Feature Store Registry
              </h1>
              <p className="text-xs text-graphite-400 mt-1">
                Inspection, vector computation versioning, and prediction readiness monitoring for downstream ML models.
              </p>
            </div>
          </div>

          {/* Developer Metric Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-graphite-400">Total Computed Vectors</span>
                <Cpu className="w-4 h-4 text-copper-400" />
              </div>
              <p className="text-2xl font-extrabold text-white mt-2">{data?.total || 0}</p>
            </div>

            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-graphite-400">Default Feature Schema</span>
                <Layers className="w-4 h-4 text-copper-400" />
              </div>
              <p className="text-2xl font-extrabold text-copper-400 mt-2">v1.0 (50+ Features)</p>
            </div>

            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-graphite-400">Prediction Readiness Rate</span>
                <RefreshCw className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-400 mt-2">100%</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 mb-6 shadow-sm">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search Transaction ID..."
                value={filters.transaction_id || ""}
                onChange={(e) => handleFilterChange({ transaction_id: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-graphite-100 text-sm placeholder-graphite-500 focus:outline-none focus:ring-2 focus:ring-copper-400"
              />
              <Search className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Feature Vector Data Table */}
          <FeatureVectorTable
            vectors={data?.items || []}
            isLoading={isLoading}
            onRecompute={handleRecompute}
            isRecomputing={recomputeMutation.isPending}
          />

          {/* Pagination Controls */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-graphite-900 border border-graphite-800 rounded-xl px-4 py-3 text-xs text-graphite-400">
              <div>
                Page <span className="font-semibold text-white">{data.page}</span> of{" "}
                <span className="font-semibold text-white">{data.pages}</span> ({data.total} total vectors)
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
