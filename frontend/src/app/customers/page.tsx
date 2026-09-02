"use client";

import { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import CustomerTable from "@/components/customers/CustomerTable";
import { useCustomers, useDeleteCustomer } from "@/hooks/useCustomers";
import { Customer, CustomerFilterParams } from "@/types/customer";
import { Users, Search, DollarSign, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomersPage() {
  const [filters, setFilters] = useState<CustomerFilterParams>({
    page: 1,
    size: 10,
    search: "",
  });

  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const { data, isLoading } = useCustomers(filters);
  const deleteMutation = useDeleteCustomer();

  const handleFilterChange = (newFilters: Partial<CustomerFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleDeleteConfirm = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => setDeletingCustomer(null),
    });
  };

  // Stat Aggregations
  const totalCount = data?.total || 0;
  const avgLtv =
    data?.items && data.items.length > 0
      ? data.items.reduce((acc, curr) => acc + curr.lifetime_value, 0) / data.items.length
      : 0;
  const flaggedCount =
    data?.items ? data.items.filter((c) => c.risk_flags && c.risk_flags.length > 0).length : 0;

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-gold-400 mb-1">
                <Users className="w-4 h-4" />
                <span>Customer Intelligence Engine</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Customer Intelligence Directory
              </h1>
              <p className="text-xs text-graphite-400 mt-1">
                Customer profiles, transaction histories, LTV metrics, and risk flag aggregation.
              </p>
            </div>
          </div>

          {/* Metrics Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-graphite-400">Total Tracked Customers</span>
                <Users className="w-4 h-4 text-gold-400" />
              </div>
              <p className="text-2xl font-extrabold text-white mt-2">{totalCount}</p>
            </div>

            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-graphite-400">Avg Page LTV</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-400 mt-2">
                ${avgLtv.toFixed(2)}
              </p>
            </div>

            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-graphite-400">Flagged Risk Customers</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-extrabold text-rose-400 mt-2">{flaggedCount}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 mb-6 shadow-sm">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search Customer ID, Name, Email, Phone..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange({ search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-graphite-100 text-sm placeholder-graphite-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
              <Search className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Customer Table */}
          <CustomerTable
            customers={data?.items || []}
            isLoading={isLoading}
            onDeleteClick={(c) => setDeletingCustomer(c)}
          />

          {/* Pagination Controls */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-graphite-900 border border-graphite-800 rounded-xl px-4 py-3 text-xs text-graphite-400">
              <div>
                Page <span className="font-semibold text-white">{data.page}</span> of{" "}
                <span className="font-semibold text-white">{data.pages}</span> ({data.total} total customers)
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
