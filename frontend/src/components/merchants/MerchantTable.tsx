"use client";

import React from "react";
import Link from "next/link";
import { Eye, Trash2, ShieldAlert, Building2 } from "lucide-react";
import { Merchant } from "@/types/merchant";
import { cn } from "@/lib/utils";

interface MerchantTableProps {
  merchants: Merchant[];
  isLoading: boolean;
  onDeleteClick: (merchant: Merchant) => void;
}

export default function MerchantTable({
  merchants,
  isLoading,
  onDeleteClick,
}: MerchantTableProps) {
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

  if (!merchants || merchants.length === 0) {
    return (
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-graphite-800 text-graphite-400 flex items-center justify-center mx-auto">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Merchants Found</h3>
        <p className="text-xs text-graphite-400 max-w-sm mx-auto">
          No merchant profiles match your search criteria. Try resetting filters or create a new merchant.
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
              <th className="px-6 py-4">Merchant & Code</th>
              <th className="px-6 py-4">Business Type & Industry</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Risk Level</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-graphite-800/60">
            {merchants.map((merchant) => (
              <tr
                key={merchant.id}
                className="hover:bg-graphite-800/40 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-white">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-white">
                      {merchant.business_name}
                    </span>
                    <span className="text-[11px] font-mono text-gold-400">
                      {merchant.merchant_code}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-graphite-200">{merchant.business_type}</span>
                    <span className="text-graphite-400 text-[11px]">{merchant.industry}</span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-graphite-200">{merchant.business_email}</span>
                    <span className="text-graphite-400 text-[11px]">{merchant.business_phone}</span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                      merchant.status === "Active" &&
                        "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                      merchant.status === "Pending Approval" &&
                        "bg-gold-500/10 border-gold-500/30 text-gold-400",
                      merchant.status === "Inactive" &&
                        "bg-graphite-800 border-graphite-700 text-graphite-400",
                      merchant.status === "Suspended" &&
                        "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    )}
                  >
                    {merchant.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                      merchant.risk_level === "Low" &&
                        "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                      merchant.risk_level === "Medium" &&
                        "bg-gold-500/10 border-gold-500/30 text-gold-400",
                      merchant.risk_level === "High" &&
                        "bg-amber-500/10 border-amber-500/30 text-amber-400",
                      merchant.risk_level === "Critical" &&
                        "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    )}
                  >
                    {merchant.risk_level} Risk
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      href={`/merchants/${merchant.id}`}
                      className="p-1.5 rounded-lg bg-graphite-800 hover:bg-graphite-700 text-graphite-300 hover:text-gold-400 transition-colors"
                      title="View & Edit Merchant"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onDeleteClick(merchant)}
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
