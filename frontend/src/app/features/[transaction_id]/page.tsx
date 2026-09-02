"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import FeatureGroupAccordion from "@/components/features/FeatureGroupAccordion";
import FeatureJsonViewer from "@/components/features/FeatureJsonViewer";
import { useFeatureVector, useRecomputeFeatures } from "@/hooks/useFeatures";
import { Cpu, ArrowLeft, RefreshCw, Layers, Code, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FeatureInspectorPageProps {
  params: { transaction_id: string };
}

export default function FeatureInspectorPage({ params }: FeatureInspectorPageProps) {
  const { transaction_id } = params;
  const { data: vector, isLoading, error } = useFeatureVector(transaction_id);
  const recomputeMutation = useRecomputeFeatures();

  const [activeTab, setActiveTab] = useState<"accordion" | "json">("accordion");

  const handleRecompute = () => {
    recomputeMutation.mutate(transaction_id);
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
          ) : error || !vector ? (
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Feature Vector Not Found</h2>
              <p className="text-xs text-graphite-400">
                No feature vector exists for transaction <span className="font-mono text-copper-400">{transaction_id}</span>.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back & Title Header Bar */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <Link
                    href="/features"
                    className="p-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 hover:text-copper-400 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-bold font-mono text-copper-400">
                        {vector.feature_vector_id}
                      </h1>
                      <span className="px-2 py-0.5 rounded bg-graphite-800 border border-graphite-700 text-white font-mono text-xs">
                        {vector.feature_version}
                      </span>
                    </div>
                    <p className="text-xs text-graphite-400 mt-0.5">
                      Target Transaction: <span className="font-mono text-white">{vector.transaction_id}</span> &bull; Generated {new Date(vector.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRecompute}
                    disabled={recomputeMutation.isPending}
                    className="px-4 py-2.5 bg-graphite-900 border border-graphite-700 hover:bg-graphite-800 text-copper-400 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <RefreshCw className={cn("w-4 h-4", recomputeMutation.isPending && "animate-spin")} />
                    <span>{recomputeMutation.isPending ? "Recomputing..." : "Recompute Vector"}</span>
                  </button>
                </div>
              </div>

              {/* Vector Status Header */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-xs text-graphite-400 font-medium">Feature Count</span>
                    <p className="text-lg font-bold text-white mt-0.5">{vector.feature_count} Features</p>
                  </div>

                  <div className="h-8 w-px bg-graphite-800" />

                  <div>
                    <span className="text-xs text-graphite-400 font-medium">Group Schema</span>
                    <p className="text-lg font-bold text-copper-400 mt-0.5">{vector.feature_group}</p>
                  </div>
                </div>

                <div>
                  {vector.prediction_ready ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ML Prediction Ready</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>Schema Errors Detected</span>
                    </span>
                  )}
                </div>
              </div>

              {/* View Tabs */}
              <div className="flex items-center space-x-2 border-b border-graphite-800 pb-2">
                <button
                  onClick={() => setActiveTab("accordion")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors",
                    activeTab === "accordion"
                      ? "bg-copper-500/10 text-copper-400 border border-copper-500/30"
                      : "text-graphite-400 hover:text-white hover:bg-graphite-900"
                  )}
                >
                  <Layers className="w-4 h-4" />
                  <span>Feature Groups Accordion</span>
                </button>

                <button
                  onClick={() => setActiveTab("json")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors",
                    activeTab === "json"
                      ? "bg-copper-500/10 text-copper-400 border border-copper-500/30"
                      : "text-graphite-400 hover:text-white hover:bg-graphite-900"
                  )}
                >
                  <Code className="w-4 h-4" />
                  <span>Raw JSON Payload</span>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "accordion" ? (
                <FeatureGroupAccordion payload={vector.feature_payload} />
              ) : (
                <FeatureJsonViewer payload={vector.feature_payload} />
              )}
            </div>
          )}
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
