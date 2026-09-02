"use client";

import React from "react";
import Link from "next/link";
import { Eye, Trash2, UserCheck, AlertTriangle } from "lucide-react";
import { Customer } from "@/types/customer";

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  onDeleteClick: (customer: Customer) => void;
}

export default function CustomerTable({
  customers,
  isLoading,
  onDeleteClick,
}: CustomerTableProps) {
  if (isLoading) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-graphite-800/50 rounded-lg w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-graphite-800 text-graphite-400 flex items-center justify-center mx-auto">
          <UserCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Customer Profiles Found</h3>
        <p className="text-xs text-graphite-400 max-w-sm mx-auto">
          No customer records match your filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-graphite-300">
          <thead className="bg-graphite-950/80 uppercase tracking-wider text-[10px] font-semibold text-graphite-400 border-b border-graphite-800">
            <tr>
              <th className="px-6 py-4">Customer & Code</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Lifetime Value (LTV)</th>
              <th className="px-6 py-4">Txn Stats</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Risk Flags</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-graphite-800/60">
            {customers.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-graphite-800/40 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-white">
                      {c.full_name}
                    </span>
                    <span className="text-[11px] font-mono text-gold-400">
                      {c.customer_id}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-graphite-200">{c.email}</span>
                    <span className="text-graphite-400 text-[11px]">{c.phone || "No phone"}</span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-emerald-400">
                      ${c.lifetime_value.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-graphite-400">
                      Avg: ${c.average_transaction_value.toFixed(2)}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-graphite-200 font-medium">
                      {c.total_transactions} txns ({c.successful_transactions} succ)
                    </span>
                    {c.chargebacks > 0 && (
                      <span className="text-rose-400 text-[11px] font-semibold">
                        {c.chargebacks} chargebacks
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 text-graphite-300">
                  {c.country} {c.city ? `(${c.city})` : ""}
                </td>

                <td className="px-6 py-4">
                  {c.risk_flags && c.risk_flags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {c.risk_flags.map((flag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-emerald-400">Low Risk</span>
                  )}
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      href={`/customers/${c.id}`}
                      className="p-1.5 rounded-lg bg-graphite-800 hover:bg-graphite-700 text-graphite-300 hover:text-gold-400 transition-colors"
                      title="View Customer Profile & Timeline"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onDeleteClick(c)}
                      className="p-1.5 rounded-lg bg-graphite-800 hover:bg-rose-900/40 text-graphite-400 hover:text-rose-400 transition-colors"
                      title="Soft Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
