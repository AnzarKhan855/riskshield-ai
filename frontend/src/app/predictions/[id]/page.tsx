"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import { usePrediction } from "@/hooks/usePredictions";
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Code, Copy, Check, Cpu, ShieldAlert, Clock } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface PredictionDetailsPageProps {
  params: { id: string };
}

export default function PredictionDetailsPage({ params }: PredictionDetailsPageProps) {
  const { id } = params;
  const { data: prediction, isLoading, error } = usePrediction(id);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopyJson = () => {
    if (prediction) {
      navigator.clipboard.writeText(JSON.stringify(prediction.raw_output_json, null, 2));
      setCopied(true);
      showToast("Raw output JSON copied to clipboard!", "info");
      setTimeout(() => setCopied(false), 2000);
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
          ) : error || !prediction ? (
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
              <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Prediction Record Not Found</h2>
              <p className="text-xs text-graphite-400">
                The requested prediction log <span className="font-mono text-copper-400">{id}</span> could not be located.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center space-x-3">
                <Link
                  href="/predictions"
                  className="p-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 hover:text-copper-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold font-mono text-copper-400">
                      {prediction.prediction_id}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded bg-graphite-800 border border-graphite-700 text-white font-mono text-xs">
                      {prediction.decision_status}
                    </span>
                  </div>
                  <p className="text-xs text-graphite-400 mt-0.5">
                    Target Txn: <span className="font-mono text-white">{prediction.transaction_id}</span> &bull; Evaluated {new Date(prediction.prediction_timestamp || prediction.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-graphite-400">Prediction Outcome</span>
                  {prediction.prediction_result.toUpperCase() === "ALLOW" ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ALLOW</span>
                    </span>
                  ) : prediction.prediction_result.toUpperCase() === "FLAG" ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>FLAG</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center space-x-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>BLOCK</span>
                    </span>
                  )}
                </div>

                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-graphite-400">Confidence Score</span>
                  <span className="text-lg font-extrabold font-mono text-white">
                    {(prediction.confidence_score * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-graphite-400">Inference Latency</span>
                  <span className="text-lg font-extrabold font-mono text-sky-400">
                    {prediction.inference_time_ms} ms
                  </span>
                </div>

                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-graphite-400">Feature Vector Link</span>
                  {prediction.feature_vector_id ? (
                    <Link
                      href={`/features/${prediction.transaction_id}`}
                      className="text-xs font-mono text-copper-400 hover:underline flex items-center space-x-1"
                    >
                      <span>{prediction.feature_vector_id}</span>
                    </Link>
                  ) : (
                    <span className="text-xs font-mono text-graphite-500">N/A</span>
                  )}
                </div>
              </div>

              {/* Raw Output JSON Viewer */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-graphite-950 px-5 py-3 border-b border-graphite-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400">
                    <Code className="w-4 h-4" />
                    <span>Raw Model Inference Output JSON</span>
                  </div>

                  <button
                    onClick={handleCopyJson}
                    className="px-3 py-1 bg-graphite-800 hover:bg-graphite-700 text-graphite-200 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-5 font-mono text-xs text-graphite-200 bg-graphite-950 overflow-x-auto max-h-[400px] leading-relaxed">
                  {JSON.stringify(prediction.raw_output_json, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
