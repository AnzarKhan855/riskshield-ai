"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import ModelMetricsCard from "@/components/models/ModelMetricsCard";
import { useModel, usePromoteModel } from "@/hooks/useModels";
import { Cpu, ArrowLeft, ShieldCheck, ArrowUpRight, AlertCircle, Layers, User, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ModelDetailsPageProps {
  params: { id: string };
}

export default function ModelDetailsPage({ params }: ModelDetailsPageProps) {
  const { id } = params;
  const { data: model, isLoading, error } = useModel(id);
  const promoteMutation = usePromoteModel();

  const handlePromote = () => {
    if (model) {
      promoteMutation.mutate(model.model_id);
    }
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
          ) : error || !model ? (
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Model Artifact Not Found</h2>
              <p className="text-xs text-graphite-400">
                The requested model <span className="font-mono text-copper-400">{id}</span> could not be located in ModelRegistry.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <Link
                    href="/models"
                    className="p-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 hover:text-copper-400 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-bold text-white">{model.model_name}</h1>
                      <span className="px-2 py-0.5 rounded bg-graphite-800 border border-graphite-700 text-white font-mono text-xs">
                        {model.version}
                      </span>
                    </div>
                    <p className="text-xs text-graphite-400 mt-0.5">
                      Model ID: <span className="font-mono text-copper-400">{model.model_id}</span> &bull; Algorithm: {model.algorithm}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {!model.production_flag ? (
                    <button
                      onClick={handlePromote}
                      disabled={promoteMutation.isPending}
                      className="px-4 py-2.5 bg-copper-500 hover:bg-copper-400 text-graphite-950 font-bold text-xs rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>{promoteMutation.isPending ? "Promoting..." : "Promote to Production"}</span>
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-lg flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>ACTIVE PRODUCTION MODEL</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Metrics Card */}
              <ModelMetricsCard model={model} />

              {/* Model Specifications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400">
                    <Layers className="w-4 h-4" />
                    <span>Model Architecture & Framework</span>
                  </div>
                  <div className="space-y-1 text-xs text-graphite-300 pt-1">
                    <p><span className="text-graphite-400">Framework:</span> <span className="font-semibold text-white">{model.framework}</span></p>
                    <p><span className="text-graphite-400">Business Domain:</span> {model.business_domain}</p>
                    <p><span className="text-graphite-400">Target Type:</span> {model.model_type}</p>
                  </div>
                </div>

                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400">
                    <Cpu className="w-4 h-4" />
                    <span>Schema & Version Compatibility</span>
                  </div>
                  <div className="space-y-1 text-xs text-graphite-300 pt-1 font-mono">
                    <p><span className="text-graphite-400 font-sans">Feature Version:</span> {model.feature_version}</p>
                    <p><span className="text-graphite-400 font-sans">Input Schema:</span> {model.input_schema_version}</p>
                    <p><span className="text-graphite-400 font-sans">Output Schema:</span> {model.output_schema_version}</p>
                  </div>
                </div>

                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400">
                    <User className="w-4 h-4" />
                    <span>Ownership & Lifecycle</span>
                  </div>
                  <div className="space-y-1 text-xs text-graphite-300 pt-1">
                    <p><span className="text-graphite-400">Owner:</span> {model.owner}</p>
                    <p><span className="text-graphite-400">Status:</span> <span className="font-semibold text-white">{model.model_status}</span></p>
                    <p><span className="text-graphite-400">Registered:</span> {new Date(model.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
