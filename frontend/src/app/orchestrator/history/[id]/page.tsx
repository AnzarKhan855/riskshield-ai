"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import CompositeRiskCard from "@/components/orchestrator/CompositeRiskCard";
import ExecutionTimelineGraph from "@/components/orchestrator/ExecutionTimelineGraph";
import { useOrchestrationDetail } from "@/hooks/useOrchestrator";
import { Cpu, ArrowLeft, Code, Copy, Check, AlertCircle, Layers, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface OrchestrationTraceDetailsPageProps {
  params: { id: string };
}

export default function OrchestrationTraceDetailsPage({ params }: OrchestrationTraceDetailsPageProps) {
  const { id } = params;
  const { data: record, isLoading, error } = useOrchestrationDetail(id);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopyJson = () => {
    if (record) {
      navigator.clipboard.writeText(JSON.stringify(record, null, 2));
      setCopied(true);
      showToast("Full orchestration trace JSON copied to clipboard!", "info");
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
          ) : error || !record ? (
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Orchestration Trace Not Found</h2>
              <p className="text-xs text-graphite-400">
                The requested orchestration trace <span className="font-mono text-copper-400">{id}</span> could not be located.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center space-x-3">
                <Link
                  href="/orchestrator/history"
                  className="p-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 hover:text-copper-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold font-mono text-copper-400">
                      {record.prediction_id}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded bg-graphite-800 border border-graphite-700 text-white font-mono text-xs">
                      {record.executed_models?.length || 0} Models Executed
                    </span>
                  </div>
                  <p className="text-xs text-graphite-400 mt-0.5">
                    Transaction ID: <span className="font-mono text-white">{record.transaction_id}</span> &bull; Executed {new Date(record.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Composite Risk Score Gauge */}
              <CompositeRiskCard
                overallRiskScore={record.overall_risk_score}
                confidence={record.confidence}
                riskLevel={record.composite_risk_level}
                executionTimeMs={record.execution_time_ms}
              />

              {/* Parallel Execution Timeline Graph */}
              <ExecutionTimelineGraph
                individualResults={record.individual_results}
                totalLatencyMs={record.execution_time_ms}
              />

              {/* Individual Model Results Table */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-graphite-950 px-5 py-3 border-b border-graphite-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400">
                    <Layers className="w-4 h-4" />
                    <span>Individual Model Execution Results Breakdown</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-graphite-300">
                    <thead className="bg-graphite-950/80 uppercase tracking-wider text-[10px] font-semibold text-graphite-400 border-b border-graphite-800">
                      <tr>
                        <th className="px-6 py-3">Domain Model Type</th>
                        <th className="px-6 py-3">Model Name & ID</th>
                        <th className="px-6 py-3">Framework</th>
                        <th className="px-6 py-3">Raw Outcome</th>
                        <th className="px-6 py-3">Risk Score</th>
                        <th className="px-6 py-3">Confidence</th>
                        <th className="px-6 py-3">Latency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-graphite-800/60 font-mono text-xs">
                      {Object.entries(record.individual_results || {}).map(([mType, res]) => (
                        <tr key={mType} className="hover:bg-graphite-800/40 transition-colors">
                          <td className="px-6 py-3.5 font-sans font-semibold text-white">
                            {mType}
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex flex-col font-sans">
                              <span className="font-semibold text-graphite-200">{res.model_name}</span>
                              <span className="font-mono text-[11px] text-copper-400">{res.model_id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-copper-400">
                            {res.framework}
                          </td>
                          <td className="px-6 py-3.5">
                            {res.raw_result.toUpperCase() === "ALLOW" ? (
                              <span className="text-emerald-400 font-bold">ALLOW</span>
                            ) : res.raw_result.toUpperCase() === "FLAG" ? (
                              <span className="text-amber-400 font-bold">FLAG</span>
                            ) : (
                              <span className="text-rose-400 font-bold">BLOCK</span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 font-bold text-white">
                            {res.score.toFixed(1)} / 100
                          </td>
                          <td className="px-6 py-3.5 text-graphite-300">
                            {(res.confidence * 100).toFixed(1)}%
                          </td>
                          <td className="px-6 py-3.5 text-sky-400">
                            {res.latency_ms} ms
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Raw Trace JSON Inspector */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-graphite-950 px-5 py-3 border-b border-graphite-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400">
                    <Code className="w-4 h-4" />
                    <span>Raw Orchestration Trace JSON Payload</span>
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
                  {JSON.stringify(record, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
