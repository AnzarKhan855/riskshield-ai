"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import ModelTable from "@/components/models/ModelTable";
import { useModels, usePromoteModel } from "@/hooks/useModels";
import { ModelFilterParams } from "@/types/model_registry";
import { Cpu, Plus, Search, Layers, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ModelsRegistryPage() {
  const [filters, setFilters] = useState<ModelFilterParams>({
    page: 1,
    size: 10,
    search: "",
  });

  const { data, isLoading } = useModels(filters);
  const promoteMutation = usePromoteModel();

  const handleFilterChange = (newFilters: Partial<ModelFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handlePromote = (modelId: string) => {
    promoteMutation.mutate(modelId);
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400 mb-1">
                <Cpu className="w-4 h-4 text-copper-400" />
                <span>Enterprise Machine Learning Platform</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Model Registry Directory
              </h1>
              <p className="text-xs text-graphite-400 mt-1">
                Host, version, monitor, and deploy production AI models across RiskShield AI business domains.
              </p>
            </div>

            <Link
              href="/models/register"
              className="px-4 py-2.5 bg-copper-500 hover:bg-copper-400 text-graphite-950 font-bold text-xs rounded-lg transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Model</span>
            </Link>
          </div>

          {/* Metric Summary Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-graphite-400">Total Registered Models</span>
                <Cpu className="w-4 h-4 text-copper-400" />
              </div>
              <p className="text-2xl font-extrabold text-white mt-2">{data?.total || 0}</p>
            </div>

            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-graphite-400">Active Production Models</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-400 mt-2">
                {data?.items.filter((m) => m.production_flag).length || 0} Models
              </p>
            </div>

            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-graphite-400">Supported Frameworks</span>
                <Layers className="w-4 h-4 text-copper-400" />
              </div>
              <p className="text-2xl font-extrabold text-copper-400 mt-2">XGBoost &bull; ONNX &bull; PyTorch</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 mb-6 shadow-sm">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search by Model Name, ID, or Algorithm..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange({ search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-graphite-100 text-sm placeholder-graphite-500 focus:outline-none focus:ring-2 focus:ring-copper-400"
              />
              <Search className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Model Registry Data Table */}
          <ModelTable
            models={data?.items || []}
            isLoading={isLoading}
            onPromote={handlePromote}
            isPromoting={promoteMutation.isPending}
          />

          {/* Pagination Controls */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-graphite-900 border border-graphite-800 rounded-xl px-4 py-3 text-xs text-graphite-400">
              <div>
                Page <span className="font-semibold text-white">{data.page}</span> of{" "}
                <span className="font-semibold text-white">{data.pages}</span> ({data.total} total models)
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
