"use client";

import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionFormSchema, TransactionFormData } from "@/validators/transaction";
import { Transaction } from "@/types/transaction";
import { useMerchants } from "@/hooks/useMerchants";
import { Save, ArrowLeft, DollarSign } from "lucide-react";
import Link from "next/link";

interface TransactionFormProps {
  initialData?: Transaction;
  onSubmit: (data: TransactionFormData) => void;
  isSubmitting: boolean;
  title: string;
}

export default function TransactionForm({
  initialData,
  onSubmit,
  isSubmitting,
  title,
}: TransactionFormProps) {
  const { data: merchantsData } = useMerchants({ size: 100 });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      merchant_id: initialData?.merchant_id || "",
      customer_id: initialData?.customer_id || "",
      payment_method: initialData?.payment_method || "Credit Card",
      card_network: initialData?.card_network || "Visa",
      card_bin: initialData?.card_bin || "",
      currency: initialData?.currency || "USD",
      amount: initialData?.amount || 100.0,
      fee: initialData?.fee || 2.5,
      tax: initialData?.tax || 1.0,
      status: initialData?.status || "Pending",
      transaction_type: initialData?.transaction_type || "Payment",
      country: initialData?.country || "United States",
      state: initialData?.state || "",
      city: initialData?.city || "",
      ip_address: initialData?.ip_address || "",
      device_id: initialData?.device_id || "",
      device_type: initialData?.device_type || "Desktop",
      operating_system: initialData?.operating_system || "Windows 11",
      browser: initialData?.browser || "Chrome",
      latitude: initialData?.latitude || undefined,
      longitude: initialData?.longitude || undefined,
      reference_number: initialData?.reference_number || "",
      gateway_response: initialData?.gateway_response || "",
      failure_reason: initialData?.failure_reason || "",
    },
  });

  const amountVal = useWatch({ control, name: "amount" }) || 0;
  const feeVal = useWatch({ control, name: "fee" }) || 0;
  const taxVal = useWatch({ control, name: "tax" }) || 0;

  const calculatedNet = Math.max(0, amountVal - feeVal - taxVal).toFixed(2);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/transactions"
            className="p-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 hover:text-gold-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
            <p className="text-xs text-graphite-400">Configure transaction telemetry & payment details</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-graphite-950 font-semibold text-xs rounded-lg shadow-lg shadow-gold-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? "Processing..." : "Save Transaction"}</span>
        </button>
      </div>

      {/* Financial Details */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gold-400 border-b border-graphite-800 pb-2">
          1. Financials & Merchant Assignment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Select Merchant *
            </label>
            <select
              {...register("merchant_id")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="">Select Merchant...</option>
              {merchantsData?.items.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.business_name} ({m.merchant_code})
                </option>
              ))}
            </select>
            {errors.merchant_id && (
              <p className="mt-1 text-xs text-rose-400">{errors.merchant_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Customer ID
            </label>
            <input
              type="text"
              placeholder="e.g. CUST-99210"
              {...register("customer_id")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Currency
            </label>
            <input
              type="text"
              placeholder="USD"
              {...register("currency")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Transaction Amount ($) *
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="100.00"
              {...register("amount")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-rose-400">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Gateway Fee ($)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="2.50"
              {...register("fee")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Calculated Net Payout ($)
            </label>
            <div className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-800 border border-graphite-700 text-emerald-400 font-bold text-sm">
              ${calculatedNet}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Instrument */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gold-400 border-b border-graphite-800 pb-2">
          2. Payment Method & Instrument
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Payment Method *
            </label>
            <select
              {...register("payment_method")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="UPI">UPI</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Wallet">Wallet</option>
              <option value="EMI">EMI</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Card Network
            </label>
            <input
              type="text"
              placeholder="e.g. Visa / Mastercard"
              {...register("card_network")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Masked Card BIN
            </label>
            <input
              type="text"
              placeholder="411111******1111"
              {...register("card_bin")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Transaction Type
            </label>
            <select
              {...register("transaction_type")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="Payment">Payment</option>
              <option value="Refund">Refund</option>
              <option value="Settlement">Settlement</option>
              <option value="Payout">Payout</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status & Geo Telemetry */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gold-400 border-b border-graphite-800 pb-2">
          3. Status & Telemetry
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Status
            </label>
            <select
              {...register("status")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="Success">Success</option>
              <option value="Processing">Processing</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Refunded">Refunded</option>
              <option value="Chargeback">Chargeback</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Country
            </label>
            <input
              type="text"
              placeholder="United States"
              {...register("country")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              IP Address
            </label>
            <input
              type="text"
              placeholder="192.168.1.1"
              {...register("ip_address")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
