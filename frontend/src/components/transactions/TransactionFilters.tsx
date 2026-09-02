"use client";

import React from "react";
import { Search, Filter, RotateCcw, Calendar, DollarSign } from "lucide-react";
import { TransactionFilterParams } from "@/types/transaction";

interface TransactionFiltersProps {
  filters: TransactionFilterParams;
  onFilterChange: (newFilters: Partial<TransactionFilterParams>) => void;
  onReset: () => void;
}

export default function TransactionFilters({
  filters,
  onFilterChange,
  onReset,
}: TransactionFiltersProps) {
  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-3 sm:p-4 mb-6 space-y-4 shadow-sm w-full max-w-full">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full">
        {/* Search Input */}
        <div className="relative w-full md:w-80 min-w-0">
          <input
            type="text"
            placeholder="Search TXN ID, Customer, Reference..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            className="w-full pl-10 pr-4 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-graphite-100 text-sm placeholder-graphite-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
          <Search className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
          <select
            value={filters.status || ""}
            onChange={(e) => onFilterChange({ status: e.target.value || undefined, page: 1 })}
            className="px-3 py-1.5 bg-graphite-950 border border-graphite-700 rounded-lg text-graphite-200 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Processing">Processing</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Refunded">Refunded</option>
            <option value="Chargeback">Chargeback</option>
          </select>

          <select
            value={filters.payment_method || ""}
            onChange={(e) =>
              onFilterChange({ payment_method: e.target.value || undefined, page: 1 })
            }
            className="px-3 py-1.5 bg-graphite-950 border border-graphite-700 rounded-lg text-graphite-200 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Wallet">Wallet</option>
            <option value="EMI">EMI</option>
          </select>

          <div className="flex items-center space-x-1 bg-graphite-950 border border-graphite-700 rounded-lg px-2.5 py-1">
            <DollarSign className="w-3.5 h-3.5 text-gold-400" />
            <input
              type="number"
              placeholder="Min $"
              value={filters.min_amount || ""}
              onChange={(e) =>
                onFilterChange({
                  min_amount: e.target.value ? Number(e.target.value) : undefined,
                  page: 1,
                })
              }
              className="w-16 bg-transparent text-xs text-graphite-100 placeholder-graphite-500 focus:outline-none"
            />
            <span className="text-graphite-500 text-xs">-</span>
            <input
              type="number"
              placeholder="Max $"
              value={filters.max_amount || ""}
              onChange={(e) =>
                onFilterChange({
                  max_amount: e.target.value ? Number(e.target.value) : undefined,
                  page: 1,
                })
              }
              className="w-16 bg-transparent text-xs text-graphite-100 placeholder-graphite-500 focus:outline-none"
            />
          </div>

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
