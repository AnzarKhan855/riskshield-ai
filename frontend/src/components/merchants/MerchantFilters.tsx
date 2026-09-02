"use client";

import React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import { MerchantFilterParams } from "@/types/merchant";

interface MerchantFiltersProps {
  filters: MerchantFilterParams;
  onFilterChange: (newFilters: Partial<MerchantFilterParams>) => void;
  onReset: () => void;
}

export default function MerchantFilters({
  filters,
  onFilterChange,
  onReset,
}: MerchantFiltersProps) {
  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 mb-6 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search business, code, email, tax IDs..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            className="w-full pl-10 pr-4 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-graphite-100 text-sm placeholder-graphite-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
          />
          <Search className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2 text-xs font-semibold text-graphite-400">
            <Filter className="w-3.5 h-3.5 text-gold-400" />
            <span>Filters:</span>
          </div>

          <select
            value={filters.status || ""}
            onChange={(e) => onFilterChange({ status: e.target.value || undefined, page: 1 })}
            className="px-3 py-1.5 bg-graphite-950 border border-graphite-700 rounded-lg text-graphite-200 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>

          <select
            value={filters.risk_level || ""}
            onChange={(e) => onFilterChange({ risk_level: e.target.value || undefined, page: 1 })}
            className="px-3 py-1.5 bg-graphite-950 border border-graphite-700 rounded-lg text-graphite-200 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
            <option value="Critical">Critical Risk</option>
          </select>

          <button
            onClick={onReset}
            className="px-3 py-1.5 bg-graphite-800 hover:bg-graphite-700 text-graphite-300 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
