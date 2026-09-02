"use client";

import React from "react";
import { Transaction } from "@/types/transaction";
import { CreditCard, ArrowUpRight, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerTimelineProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export default function CustomerTimeline({
  transactions,
  isLoading,
}: CustomerTimelineProps) {
  if (isLoading) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-graphite-800/50 rounded-lg w-full" />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-8 text-center space-y-2">
        <Clock className="w-6 h-6 text-graphite-500 mx-auto" />
        <h4 className="text-sm font-semibold text-graphite-300">No Transaction History</h4>
        <p className="text-xs text-graphite-400">
          This customer profile has not executed any payment transactions yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 space-y-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gold-400 border-b border-graphite-800 pb-3 flex items-center space-x-2">
        <Clock className="w-4 h-4" />
        <span>Transaction History Timeline</span>
      </h3>

      <div className="relative border-l-2 border-graphite-800 ml-4 pl-6 space-y-6">
        {transactions.map((txn) => (
          <div key={txn.id} className="relative group">
            {/* Dot marker */}
            <div
              className={cn(
                "absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-graphite-950",
                txn.status === "Success" && "border-emerald-500",
                txn.status === "Processing" && "border-gold-500",
                (txn.status === "Failed" || txn.status === "Chargeback") && "border-rose-500"
              )}
            />

            <div className="bg-graphite-950 border border-graphite-800 rounded-lg p-4 flex items-center justify-between hover:border-graphite-700 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-semibold text-gold-400">
                    {txn.transaction_id}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                      txn.status === "Success" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                      txn.status === "Failed" && "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    )}
                  >
                    {txn.status}
                  </span>
                </div>
                <p className="text-xs text-graphite-400">
                  {txn.payment_method} &bull; {txn.country} &bull; {new Date(txn.timestamp).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <span className="text-base font-bold text-white">
                  ${txn.amount.toFixed(2)}
                </span>
                <p className="text-[11px] text-emerald-400 font-medium">
                  Net: ${txn.net_amount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
