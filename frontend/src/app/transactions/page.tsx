"use client";

import { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import TransactionFilters from "@/components/transactions/TransactionFilters";
import TransactionTable from "@/components/transactions/TransactionTable";
import DeleteTransactionDialog from "@/components/transactions/DeleteTransactionDialog";
import { useTransactions, useDeleteTransaction } from "@/hooks/useTransactions";
import { useToast } from "@/components/ui/toast";
import { Transaction, TransactionFilterParams } from "@/types/transaction";
import { CreditCard, Plus, Download, ChevronLeft, ChevronRight } from "lucide-react";

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilterParams>({
    page: 1,
    size: 10,
    search: "",
  });

  const [deletingTxn, setDeletingTxn] = useState<Transaction | null>(null);

  const { data, isLoading } = useTransactions(filters);
  const deleteMutation = useDeleteTransaction();
  const { showToast } = useToast();

  const handleFilterChange = (newFilters: Partial<TransactionFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      size: 10,
      search: "",
      status: undefined,
      payment_method: undefined,
      min_amount: undefined,
      max_amount: undefined,
    });
  };

  const handleDeleteConfirm = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => setDeletingTxn(null),
    });
  };

  // CSV Export Utility
  const handleExportCSV = () => {
    if (!data || !data.items || data.items.length === 0) {
      showToast("No transaction records available to export for current filters", "warning");
      return;
    }

    const headers = [
      "Transaction ID",
      "Merchant ID",
      "Customer ID",
      "Payment Method",
      "Amount",
      "Fee",
      "Tax",
      "Net Amount",
      "Status",
      "Type",
      "Country",
      "Timestamp",
    ];

    const rows = data.items.map((t) => [
      t.transaction_id,
      t.merchant_id,
      t.customer_id || "",
      t.payment_method,
      t.amount,
      t.fee,
      t.tax,
      t.net_amount,
      t.status,
      t.transaction_type,
      t.country,
      t.timestamp,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RiskShield_Transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-gold-400 mb-1">
                <CreditCard className="w-4 h-4" />
                <span>Payment Processing Registry</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Transaction Management
              </h1>
              <p className="text-xs text-graphite-400 mt-1">
                Real-time transaction monitoring, filtering, and audit management.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 bg-graphite-900 border border-graphite-700 hover:bg-graphite-800 text-graphite-200 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4 text-gold-400" />
                <span>Export CSV</span>
              </button>

              <Link
                href="/transactions/new"
                className="px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-graphite-950 font-semibold text-xs rounded-lg shadow-lg shadow-gold-500/20 flex items-center space-x-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Transaction</span>
              </Link>
            </div>
          </div>

          {/* Advanced Search & Filter Controls */}
          <TransactionFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />

          {/* Data Table */}
          <TransactionTable
            transactions={data?.items || []}
            isLoading={isLoading}
            onDeleteClick={(txn) => setDeletingTxn(txn)}
          />

          {/* Pagination Controls */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-graphite-900 border border-graphite-800 rounded-xl px-4 py-3 text-xs text-graphite-400">
              <div>
                Showing Page <span className="font-semibold text-white">{data.page}</span> of{" "}
                <span className="font-semibold text-white">{data.pages}</span> ({data.total} total records)
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
          <DeleteTransactionDialog
            transaction={deletingTxn}
            isOpen={!!deletingTxn}
            onClose={() => setDeletingTxn(null)}
            onConfirm={handleDeleteConfirm}
            isDeleting={deleteMutation.isPending}
          />
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
