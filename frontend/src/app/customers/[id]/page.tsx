"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import CustomerTimeline from "@/components/customers/CustomerTimeline";
import { useCustomer, useCustomerTimeline } from "@/hooks/useCustomers";
import { UserCheck, DollarSign, Calendar, AlertCircle, ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface CustomerDetailsPageProps {
  params: { id: string };
}

export default function CustomerDetailsPage({ params }: CustomerDetailsPageProps) {
  const { id } = params;
  const { data: customer, isLoading, error } = useCustomer(id);
  const { data: timeline = [], isLoading: isTimelineLoading } = useCustomerTimeline(id);

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-8 space-y-4 animate-pulse">
              <div className="h-8 bg-graphite-800 rounded w-1/3" />
              <div className="h-64 bg-graphite-800/50 rounded-xl" />
            </div>
          ) : error || !customer ? (
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Customer Profile Not Found</h2>
              <p className="text-xs text-graphite-400">
                The requested customer profile could not be located or has been archived.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back & Title Bar */}
              <div className="flex items-center space-x-3">
                <Link
                  href="/customers"
                  className="p-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 hover:text-gold-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-white tracking-tight">{customer.full_name}</h1>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-graphite-800 text-gold-400 border border-graphite-700">
                      {customer.customer_id}
                    </span>
                  </div>
                  <p className="text-xs text-graphite-400 mt-0.5">
                    {customer.email} &bull; Customer since {new Date(customer.customer_since).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* LTV & Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4">
                  <span className="text-xs text-graphite-400 font-medium">Lifetime Value (LTV)</span>
                  <p className="text-xl font-bold text-emerald-400 mt-1">
                    ${customer.lifetime_value.toFixed(2)}
                  </p>
                </div>

                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4">
                  <span className="text-xs text-graphite-400 font-medium">Average Transaction</span>
                  <p className="text-xl font-bold text-white mt-1">
                    ${customer.average_transaction_value.toFixed(2)}
                  </p>
                </div>

                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4">
                  <span className="text-xs text-graphite-400 font-medium">Total Transactions</span>
                  <p className="text-xl font-bold text-white mt-1">{customer.total_transactions}</p>
                </div>

                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4">
                  <span className="text-xs text-graphite-400 font-medium">Chargebacks / Refunds</span>
                  <p className="text-xl font-bold text-rose-400 mt-1">
                    {customer.chargebacks} / {customer.refunds}
                  </p>
                </div>
              </div>

              {/* Risk Flags Banner */}
              {customer.risk_flags && customer.risk_flags.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center space-x-3">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-rose-400">Risk Flags Detected</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {customer.risk_flags.map((flag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-rose-900/50 text-rose-300 text-[10px] font-semibold rounded">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Activity Timeline */}
              <CustomerTimeline
                transactions={timeline}
                isLoading={isTimelineLoading}
              />
            </div>
          )}
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
