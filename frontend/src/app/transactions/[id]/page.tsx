"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import TransactionForm from "@/components/transactions/TransactionForm";
import { useTransaction, useUpdateTransaction } from "@/hooks/useTransactions";
import { TransactionFormData } from "@/validators/transaction";
import { CreditCard, AlertCircle, Globe, Monitor, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionDetailsPageProps {
  params: { id: string };
}

export default function TransactionDetailsPage({ params }: TransactionDetailsPageProps) {
  const { id } = params;
  const { data: transaction, isLoading, error } = useTransaction(id);
  const updateMutation = useUpdateTransaction(id);

  const handleSubmit = (data: TransactionFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-8 space-y-4 animate-pulse">
              <div className="h-8 bg-graphite-800 rounded w-1/3" />
              <div className="h-64 bg-graphite-800/50 rounded-xl" />
            </div>
          ) : error || !transaction ? (
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Transaction Not Found</h2>
              <p className="text-xs text-graphite-400">
                The requested transaction record could not be found or has been archived.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Transaction Summary Header Card */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm w-full max-w-full overflow-hidden">
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold shrink-0">
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-bold font-mono text-gold-400 truncate">{transaction.transaction_id}</h2>
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-semibold border shrink-0",
                          transaction.status === "Success" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                          transaction.status === "Processing" && "bg-gold-500/10 border-gold-500/30 text-gold-400",
                          (transaction.status === "Failed" || transaction.status === "Chargeback") && "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        )}
                      >
                        {transaction.status}
                      </span>
                    </div>
                    <p className="text-xs text-graphite-400 mt-0.5 truncate">
                      {transaction.payment_method} &bull; Executed {new Date(transaction.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-left md:text-right w-full md:w-auto shrink-0">
                  <div className="text-xl sm:text-2xl font-extrabold text-white">
                    ${transaction.amount.toFixed(2)} <span className="text-xs text-graphite-400">{transaction.currency}</span>
                  </div>
                  <div className="text-xs text-emerald-400 font-medium">
                    Net: ${transaction.net_amount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Geo & Device Telemetry Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gold-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">IP & Location</h4>
                    <p className="text-xs text-graphite-400">
                      {transaction.ip_address || "N/A"} &bull; {transaction.country}
                    </p>
                  </div>
                </div>

                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 flex items-center space-x-3">
                  <Monitor className="w-5 h-5 text-gold-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Device Environment</h4>
                    <p className="text-xs text-graphite-400">
                      {transaction.device_type || "N/A"} &bull; {transaction.operating_system || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gold-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Geo Coordinates</h4>
                    <p className="text-xs text-graphite-400">
                      {transaction.latitude && transaction.longitude
                        ? `${transaction.latitude}, ${transaction.longitude}`
                        : "No GPS lock"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cross-Module AI Workflow Integration Bar */}
              <div className="bg-gradient-to-r from-graphite-900 via-graphite-950 to-graphite-900 border border-copper-500/30 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-copper-400 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-copper-400 font-mono">
                      Integrated AI Workflow & Entity Graph Navigation
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-graphite-400">Transaction ID: {transaction.transaction_id}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
                  <a
                    href={`/features/${transaction.transaction_id}`}
                    className="p-3 rounded-xl bg-graphite-900 border border-graphite-800 hover:border-copper-400/50 hover:bg-graphite-850 flex flex-col justify-between transition-all group"
                  >
                    <span className="text-[10px] font-mono uppercase text-graphite-400 group-hover:text-copper-400">Step 2: Features</span>
                    <span className="text-xs font-bold text-white mt-1">Feature Vector ➔</span>
                  </a>

                  <a
                    href={`/decisions`}
                    className="p-3 rounded-xl bg-graphite-900 border border-graphite-800 hover:border-copper-400/50 hover:bg-graphite-850 flex flex-col justify-between transition-all group"
                  >
                    <span className="text-[10px] font-mono uppercase text-graphite-400 group-hover:text-copper-400">Step 6: Decisions</span>
                    <span className="text-xs font-bold text-white mt-1">Evaluate Decision ➔</span>
                  </a>

                  <a
                    href={`/explanations`}
                    className="p-3 rounded-xl bg-graphite-900 border border-graphite-800 hover:border-copper-400/50 hover:bg-graphite-850 flex flex-col justify-between transition-all group"
                  >
                    <span className="text-[10px] font-mono uppercase text-graphite-400 group-hover:text-copper-400">Step 7: Explainability</span>
                    <span className="text-xs font-bold text-white mt-1">TreeSHAP Impact ➔</span>
                  </a>

                  <a
                    href={`/cases`}
                    className="p-3 rounded-xl bg-graphite-900 border border-graphite-800 hover:border-copper-400/50 hover:bg-graphite-850 flex flex-col justify-between transition-all group"
                  >
                    <span className="text-[10px] font-mono uppercase text-graphite-400 group-hover:text-copper-400">Step 8: Cases</span>
                    <span className="text-xs font-bold text-white mt-1">Investigation File ➔</span>
                  </a>

                  <a
                    href={`/graph`}
                    className="p-3 rounded-xl bg-graphite-900 border border-graphite-800 hover:border-copper-400/50 hover:bg-graphite-850 flex flex-col justify-between transition-all group"
                  >
                    <span className="text-[10px] font-mono uppercase text-graphite-400 group-hover:text-copper-400">Step 9: Knowledge Graph</span>
                    <span className="text-xs font-bold text-white mt-1">Mule Ring Graph ➔</span>
                  </a>
                </div>
              </div>

              {/* Edit Form */}
              <TransactionForm
                title="Update Transaction Record"
                initialData={transaction}
                onSubmit={handleSubmit}
                isSubmitting={updateMutation.isPending}
              />
            </div>
          )}
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
