"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import RuleTable from "@/components/rules/RuleTable";
import RuleSimulator from "@/components/rules/RuleSimulator";
import { useRules } from "@/hooks/useRules";
import { RuleFilterParams } from "@/types/decision_rule";
import { Sliders, PlusCircle, Search, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function RuleStudioDirectoryPage() {
  const [filters, setFilters] = useState<RuleFilterParams>({
    page: 1,
    size: 10,
    search: "",
  });

  const { data, isLoading } = useRules(filters);

  const handleFilterChange = (newFilters: Partial<RuleFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 w-full">
            <div className="min-w-0">
              <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400 mb-1">
                <Sliders className="w-4 h-4 text-copper-400 shrink-0" />
                <span className="truncate">Enterprise Decision Intelligence Platform</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                Enterprise Rule Studio
              </h1>
              <p className="text-xs text-graphite-400 mt-1">
                Author, test, publish, and order enterprise risk rules across Merchant, Country, Velocity, and Compliance policies.
              </p>
            </div>

            <Link
              href="/rules/new"
              className="px-4 py-2.5 bg-copper-500 hover:bg-copper-400 text-graphite-950 font-bold text-xs rounded-lg transition-colors flex items-center space-x-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4 fill-graphite-950" />
              <span>Author New Decision Rule</span>
            </Link>
          </div>

          {/* Real-time Rule Simulator */}
          <div className="mb-8">
            <RuleSimulator />
          </div>

          {/* Search Bar */}
          <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 mb-6 shadow-sm">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search rules by name, ID, or description..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange({ search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-graphite-100 text-sm placeholder-graphite-500 focus:outline-none focus:ring-2 focus:ring-copper-400"
              />
              <Search className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Data Table */}
          <RuleTable rules={data?.items || []} isLoading={isLoading} />

          {/* Pagination Controls */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-graphite-900 border border-graphite-800 rounded-xl px-4 py-3 text-xs text-graphite-400">
              <div>
                Page <span className="font-semibold text-white">{data.page}</span> of{" "}
                <span className="font-semibold text-white">{data.pages}</span> ({data.total} total rules)
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
