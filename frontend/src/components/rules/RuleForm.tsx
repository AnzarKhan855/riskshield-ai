"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ruleFormSchema, RuleFormValues } from "@/validators/decision_rule";
import { Sliders, PlusCircle } from "lucide-react";

interface RuleFormProps {
  onSubmit: (values: RuleFormValues) => void;
  isLoading: boolean;
  initialValues?: Partial<RuleFormValues>;
}

export default function RuleForm({
  onSubmit,
  isLoading,
  initialValues,
}: RuleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RuleFormValues>({
    resolver: zodResolver(ruleFormSchema),
    defaultValues: {
      rule_name: "",
      rule_category: "TRANSACTION",
      priority: 50,
      version: "v1.0.0",
      status: "PUBLISHED",
      description: "",
      expression: "composite_risk_score >= 75.0",
      action: "BLOCK",
      severity: "HIGH",
      enabled: true,
      created_by: "Risk Policy Team",
      ...initialValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
          <Sliders className="w-5 h-5 text-copper-400" />
          <h2 className="text-sm font-semibold text-white">Visual Decision Rule Builder</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Rule Name *
            </label>
            <input
              type="text"
              {...register("rule_name")}
              placeholder="e.g. Extreme Velocity Burst Attack Rule"
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
            />
            {errors.rule_name && (
              <p className="text-xs text-rose-400 mt-1">{errors.rule_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Rule Category *
            </label>
            <select
              {...register("rule_category")}
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
            >
              <option value="MERCHANT">MERCHANT</option>
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="TRANSACTION">TRANSACTION</option>
              <option value="COUNTRY">COUNTRY</option>
              <option value="VELOCITY">VELOCITY</option>
              <option value="PAYMENT_METHOD">PAYMENT_METHOD</option>
              <option value="COMPLIANCE">COMPLIANCE</option>
              <option value="REGULATORY">REGULATORY</option>
              <option value="AMOUNT">AMOUNT</option>
              <option value="TIME">TIME</option>
              <option value="DEVICE">DEVICE</option>
              <option value="BEHAVIOUR">BEHAVIOUR</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Priority Integer (Lower = Higher Priority) *
            </label>
            <input
              type="number"
              {...register("priority", { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Decision Action *
            </label>
            <select
              {...register("action")}
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
            >
              <option value="APPROVE">APPROVE</option>
              <option value="REVIEW">REVIEW</option>
              <option value="BLOCK">BLOCK</option>
              <option value="ESCALATE">ESCALATE</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Boolean Expression *
            </label>
            <input
              type="text"
              {...register("expression")}
              placeholder="e.g. composite_risk_score >= 80.0 or loc_is_high_risk_country == True"
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-copper-400 font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
            />
            {errors.expression && (
              <p className="text-xs text-rose-400 mt-1">{errors.expression.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Description / Policy Context
            </label>
            <textarea
              rows={2}
              {...register("description")}
              placeholder="Brief explanation of policy rationale..."
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
            <span>{isLoading ? "Saving Rule..." : "Save & Publish Rule"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
