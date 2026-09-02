"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  orchestratorFormSchema,
  OrchestratorFormValues,
} from "@/validators/orchestrator";
import { Play, Cpu } from "lucide-react";

interface OrchestratorFormProps {
  onSubmit: (values: OrchestratorFormValues) => void;
  isLoading: boolean;
}

export default function OrchestratorForm({
  onSubmit,
  isLoading,
}: OrchestratorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrchestratorFormValues>({
    resolver: zodResolver(orchestratorFormSchema),
    defaultValues: {
      transaction_id: "TXN-ML-PRED-991",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
          <Cpu className="w-5 h-5 text-copper-400" />
          <h2 className="text-sm font-semibold text-white">
            Trigger Multi-Model AI Orchestration Pipeline
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Target Transaction ID *
            </label>
            <input
              type="text"
              {...register("transaction_id")}
              placeholder="e.g. TXN-8D93240D"
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-copper-400 focus:outline-none"
            />
            {errors.transaction_id && (
              <p className="text-xs text-rose-400 mt-1">{errors.transaction_id.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 bg-copper-500 hover:bg-copper-400 text-graphite-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-graphite-950" />
            <span>{isLoading ? "Executing Pipeline..." : "Execute Pipeline"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
