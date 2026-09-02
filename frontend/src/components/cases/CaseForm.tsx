"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { caseFormSchema, CaseFormValues } from "@/validators/investigation";
import { ShieldAlert, PlusCircle } from "lucide-react";

interface CaseFormProps {
  onSubmit: (values: CaseFormValues) => void;
  isLoading: boolean;
}

export default function CaseForm({ onSubmit, isLoading }: CaseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CaseFormValues>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      transaction_id: "TXN-ML-PRED-991",
      decision_id: "",
      category: "Fraud",
      priority: "HIGH",
      case_title: "Suspicious High-Value Fraud Alert",
      case_description: "Automated alert triggered due to elevated composite risk score and high transaction amount.",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
          <ShieldAlert className="w-5 h-5 text-copper-400" />
          <h2 className="text-sm font-semibold text-white">Create Investigation Case</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Target Transaction ID *
            </label>
            <input
              type="text"
              {...register("transaction_id")}
              placeholder="e.g. TXN-8D93240D"
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
            />
            {errors.transaction_id && (
              <p className="text-xs text-rose-400 mt-1">{errors.transaction_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Linked Decision ID (Optional)
            </label>
            <input
              type="text"
              {...register("decision_id")}
              placeholder="e.g. DEC-8B13D12B"
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Investigation Category *
            </label>
            <select
              {...register("category")}
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
            >
              <option value="Fraud">Fraud</option>
              <option value="Chargeback">Chargeback</option>
              <option value="AML">AML</option>
              <option value="Compliance">Compliance</option>
              <option value="Identity">Identity</option>
              <option value="Merchant Abuse">Merchant Abuse</option>
              <option value="Promotion Abuse">Promotion Abuse</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Case Priority *
            </label>
            <select
              {...register("priority")}
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Case Summary Title *
            </label>
            <input
              type="text"
              {...register("case_title")}
              placeholder="e.g. Suspicious Account Takeover & Rapid Velocity"
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
            />
            {errors.case_title && (
              <p className="text-xs text-rose-400 mt-1">{errors.case_title.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Initial Case Description / Context Notes
            </label>
            <textarea
              rows={3}
              {...register("case_description")}
              placeholder="Context description of the suspicious activity..."
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-graphite-800">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-copper-500 hover:bg-copper-400 text-graphite-950 font-bold text-xs rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isLoading ? "Creating Case..." : "Open Investigation Case"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
