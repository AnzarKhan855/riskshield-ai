"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import FeatureAttributionBar from "@/components/explanations/FeatureAttributionBar";
import ModelEnsembleBreakdown from "@/components/explanations/ModelEnsembleBreakdown";
import RuleImpactCard from "@/components/explanations/RuleImpactCard";
import RecommendationPanel from "@/components/explanations/RecommendationPanel";
import { useExplanation } from "@/hooks/useExplanations";
import { Cpu, ArrowLeft, Code, Copy, Check, AlertCircle, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface ExplanationWorkspacePageProps {
  params: { decision_id: string };
}

export default function ExplanationWorkspacePage({ params }: ExplanationWorkspacePageProps) {
  const { decision_id } = params;
  const { data: explanation, isLoading, error } = useExplanation(decision_id);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopyJson = () => {
    if (explanation) {
      navigator.clipboard.writeText(JSON.stringify(explanation, null, 2));
      setCopied(true);
      showToast("Explanation audit payload copied to clipboard!", "info");
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
          ) : error || !explanation ? (
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">AI Explanation Not Found</h2>
              <p className="text-xs text-graphite-400">
                The requested explanation payload for decision <span className="font-mono text-copper-400">{decision_id}</span> could not be generated.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Page Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                <div className="flex items-center space-x-3 min-w-0">
                  <Link
                    href="/explanations"
                    className="p-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 hover:text-copper-400 transition-colors shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <h1 className="text-xl sm:text-2xl font-bold font-mono text-copper-400 truncate">
                        {explanation.explanation_id}
                      </h1>
                      <span className="px-2.5 py-0.5 rounded bg-graphite-800 border border-graphite-700 text-white font-mono text-xs font-bold shrink-0">
                        DECISION {explanation.decision_id}
                      </span>
                    </div>
                    <p className="text-xs text-graphite-400 mt-0.5 truncate">
                      Target Transaction: <span className="font-mono text-white">{explanation.transaction_id}</span> &bull; Audited {new Date(explanation.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rationale Banner & Metrics Grid */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-copper-400">
                  <Cpu className="w-4 h-4" />
                  <span>Synthesized Audit Primary Rationale</span>
                </div>
                <h2 className="text-lg font-bold text-white leading-relaxed">{explanation.primary_reason}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-graphite-950 border border-graphite-800 rounded-lg p-4 space-y-1">
                    <span className="text-[10px] font-bold text-graphite-400 uppercase">Composite Risk Score</span>
                    <p className="text-2xl font-bold font-mono text-white">{explanation.composite_risk_score.toFixed(1)} / 100</p>
                  </div>

                  <div className="bg-graphite-950 border border-graphite-800 rounded-lg p-4 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Prediction Confidence Score</span>
                    <p className="text-2xl font-bold font-mono text-emerald-400">{explanation.confidence_score.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Feature Importance & SHAP Attributions */}
              <FeatureAttributionBar features={explanation.feature_contributions || []} />

              {/* AI Model Ensemble Breakdown */}
              <ModelEnsembleBreakdown models={explanation.model_contributions || []} />

              {/* Triggered Policy Rules */}
              <RuleImpactCard rules={explanation.rule_contributions || []} />

              {/* Analyst Recommendations & Audit Info */}
              <RecommendationPanel
                recommendations={explanation.recommendations || []}
                auditInfo={explanation.audit_info}
              />

              {/* Raw Explanation Payload Inspector */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-graphite-950 px-5 py-3 border-b border-graphite-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400">
                    <Code className="w-4 h-4" />
                    <span>Raw Explanation Audit Payload JSON</span>
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
                  {JSON.stringify(explanation, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
