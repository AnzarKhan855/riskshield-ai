"use client";

import React from "react";
import { Transaction } from "@/types/transaction";
import { Activity, ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LiveTransactionCardProps {
  transactions: Transaction[];
}

export default function LiveTransactionCard({ transactions }: LiveTransactionCardProps) {
  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-sm hover:border-graphite-700/60 transition-all flex flex-col h-[440px] w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-graphite-800 pb-4 mb-4 select-none shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
          <h3 className="text-base font-bold text-white tracking-tight truncate">
            Live Payment Ingestion Stream
          </h3>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
            STREAMING LIVE
          </span>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
        {transactions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-graphite-500">
            <CreditCard className="w-8 h-8 text-graphite-600" />
            <p className="text-xs font-mono">No live transaction events in queue</p>
          </div>
        ) : (
          transactions.map((t) => (
            <div
              key={t.id}
              className="bg-graphite-950 border border-graphite-800/80 rounded-xl p-3 flex items-center justify-between text-xs hover:border-copper-500/40 transition-colors"
            >
              <div className="flex flex-col min-w-0 pr-2">
                <Link
                  href={`/transactions/${t.transaction_id}`}
                  className="font-mono font-bold text-white hover:text-copper-400 truncate transition-colors"
                >
                  {t.transaction_id}
                </Link>
                <span className="text-[11px] text-graphite-400 truncate">
                  {t.payment_method} &bull; {t.country} &bull; {t.merchant_id || "MERCH-MAIN"}
                </span>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  ${t.amount.toFixed(2)}
                </span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold font-mono border",
                    t.status === "Success"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : t.status === "Processing"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  )}
                >
                  {t.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-graphite-800 pt-3 mt-3 flex items-center justify-between text-xs text-graphite-400 select-none shrink-0">
        <span className="font-mono text-[11px]">
          Showing latest {Math.min(transactions.length, 10)} live events
        </span>
        <Link
          href="/transactions"
          className="text-copper-400 font-semibold hover:underline flex items-center space-x-1"
        >
          <span>All Transactions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
