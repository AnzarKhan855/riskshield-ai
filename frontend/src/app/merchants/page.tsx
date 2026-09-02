"use client";

import { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import MerchantFilters from "@/components/merchants/MerchantFilters";
import MerchantTable from "@/components/merchants/MerchantTable";
import DeleteMerchantDialog from "@/components/merchants/DeleteMerchantDialog";
import { useMerchants, useDeleteMerchant } from "@/hooks/useMerchants";
import { Merchant, MerchantFilterParams } from "@/types/merchant";
import { Building2, Plus, ChevronLeft, ChevronRight } from "lucide-react";

export default function MerchantsPage() {
  const [filters, setFilters] = useState<MerchantFilterParams>({
    page: 1,
    size: 10,
    search: "",
  });

  const [deletingMerchant, setDeletingMerchant] = useState<Merchant | null>(null);

  const { data, isLoading } = useMerchants(filters);
  const deleteMutation = useDeleteMerchant();

  const handleFilterChange = (newFilters: Partial<MerchantFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      size: 10,
      search: "",
      status: undefined,
      risk_level: undefined,
    });
  };

  const handleDeleteConfirm = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => setDeletingMerchant(null),
    });
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-gold-400 mb-1">
                <Building2 className="w-4 h-4" />
                <span>Enterprise Registry</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Merchant Management
              </h1>
              <p className="text-xs text-graphite-400 mt-1">
                Overview and risk governance for onboarded enterprise merchants.
              </p>
            </div>

            <Link
              href="/merchants/new"
              className="px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-graphite-950 font-semibold text-xs rounded-lg shadow-lg shadow-gold-500/20 flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register Merchant</span>
            </Link>
          </div>

          {/* Search & Filter Controls */}
          <MerchantFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />

          {/* Data Table */}
          <MerchantTable
            merchants={data?.items || []}
            isLoading={isLoading}
            onDeleteClick={(merchant) => setDeletingMerchant(merchant)}
          />

          {/* Pagination Controls */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-graphite-900 border border-graphite-800 rounded-xl px-4 py-3 text-xs text-graphite-400">
              <div>
                Showing Page <span className="font-semibold text-white">{data.page}</span> of{" "}
                <span className="font-semibold text-white">{data.pages}</span> ({data.total} total merchants)
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

          {/* Delete Dialog */}
          <DeleteMerchantDialog
            merchant={deletingMerchant}
            isOpen={!!deletingMerchant}
            onClose={() => setDeletingMerchant(null)}
            onConfirm={handleDeleteConfirm}
            isDeleting={deleteMutation.isPending}
          />
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
