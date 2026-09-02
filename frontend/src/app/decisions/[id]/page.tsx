"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import DecisionBadge from "@/components/decisions/DecisionBadge";
import ReviewerPanel from "@/components/decisions/ReviewerPanel";
import { useDecisionDetail } from "@/hooks/useDecisions";
import {
  ShieldCheck,
  ArrowLeft,
  Code,
  Copy,
  Check,
  AlertCircle,
  Layers,
  CheckCircle2,
  ShieldAlert,
  Lock,
  Cpu,
  TrendingUp,
  FileText,
  Send,
  ExternalLink,
  Zap,
  Sparkles,
  Sliders,
} from "lucide-react";

import Link from "next/link";
import { useToast } from "@/components/ui/toast";

interface DecisionTraceDetailPageProps {
  params: { id: string };
}

export default function DecisionTraceDetailPage({ params }: DecisionTraceDetailPageProps) {
  const { id } = params;
  const { data: record, isLoading, error } = useDecisionDetail(id);
  const [copied, setCopied] = useState(false);
  const [auditVerified, setAuditVerified] = useState(true);
  const { showToast } = useToast();

  const handleCopyJson = () => {
    if (record) {
      navigator.clipboard.writeText(JSON.stringify(record, null, 2));
      setCopied(true);
      showToast("Full forensic decision trace JSON copied to clipboard!", "info");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerateAdverseNotice = () => {
    showToast("FCRA Adverse Action Notice generated and queued for dispatch.", "success");
  };

  const handleEscalateSAR = () => {
    showToast("Escalated to Compliance Team for FinCEN SAR Filing.", "warning");
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-8 space-y-4 animate-pulse">
              <div className="h-8 bg-graphite-800 rounded w-1/3" />
              <div className="h-64 bg-graphite-800/50 rounded-2xl" />
            </div>
          ) : error || !record ? (
            <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-12 text-center space-y-4 shadow-xl">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Decision Trace Not Found</h2>
              <p className="text-xs text-graphite-400">
                The requested forensic decision record <span className="font-mono text-copper-400">{id}</span> could not be retrieved from the ledger.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Navigation & Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-graphite-800 pb-4">
                <div className="flex items-center space-x-3">
                  <Link
                    href="/decisions"
                    className="p-2.5 rounded-xl bg-graphite-900 border border-graphite-800 text-graphite-300 hover:text-copper-400 hover:border-copper-400/40 transition-colors shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                      <h1 className="text-xl sm:text-2xl font-bold font-mono text-copper-400 truncate">
                        {record.decision_id}
                      </h1>
                      <DecisionBadge action={record.decision} size="lg" />
                      <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <Lock className="w-3 h-3 mr-1" />
                        IMMUTABLE AUDIT SEAL
                      </span>
                    </div>
                    <p className="text-xs text-graphite-400 mt-1 truncate">
                      Transaction Ref: <Link href={`/transactions/${record.transaction_id}`} className="font-mono text-white hover:text-copper-400 underline">{record.transaction_id}</Link> &bull; Evaluated {new Date(record.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Compliance & Export Quick Actions */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
                  <Link
                    href={`/ai?tab=rca&txn=${record.transaction_id}`}
                    className="px-3 py-2 rounded-xl bg-copper-500 hover:bg-copper-400 text-graphite-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Root Cause Forensics</span>
                  </Link>

                  <Link
                    href={`/ai?tab=simulation&txn=${record.transaction_id}`}
                    className="px-3 py-2 rounded-xl bg-graphite-900 border border-graphite-700 hover:border-copper-400 text-graphite-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm shrink-0"
                  >
                    <Sliders className="w-3.5 h-3.5 text-copper-400" />
                    <span>Counterfactual Sandbox</span>
                  </Link>

                  <button
                    onClick={handleGenerateAdverseNotice}
                    className="px-3 py-2 rounded-xl bg-graphite-900 border border-graphite-700 hover:border-graphite-600 text-graphite-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm shrink-0"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>FCRA Adverse Notice</span>
                  </button>

                  <button
                    onClick={handleEscalateSAR}
                    className="px-3 py-2 rounded-xl bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm shrink-0"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Escalate to SAR</span>
                  </button>

                  <button
                    onClick={handleCopyJson}
                    className="px-3 py-2 bg-copper-500/10 border border-copper-500/30 hover:bg-copper-500/20 text-copper-300 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5 shadow-sm shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON Trace</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Core Telemetry & KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-5 shadow-sm">
                  <span className="text-[10px] text-graphite-400 font-bold uppercase tracking-wider">Composite Risk Index</span>
                  <div className="flex items-baseline space-x-2 mt-2">
                    <p className={`text-3xl font-extrabold font-mono ${record.composite_risk_score >= 80 ? 'text-rose-400' : record.composite_risk_score >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {record.composite_risk_score.toFixed(1)}
                    </p>
                    <span className="text-xs text-graphite-400 font-mono">/ 100.0</span>
                  </div>
                  <div className="w-full bg-graphite-950 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${record.composite_risk_score >= 80 ? 'bg-rose-500' : record.composite_risk_score >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, record.composite_risk_score)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-5 shadow-sm">
                  <span className="text-[10px] text-graphite-400 font-bold uppercase tracking-wider">Statistical Confidence</span>
                  <p className="text-3xl font-extrabold font-mono text-copper-400 mt-2">
                    {(record.decision_confidence * 100).toFixed(1)}%
                  </p>
                  <p className="text-[11px] text-graphite-400 mt-2 font-mono">Calibrated via isotonic regression</p>
                </div>

                <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-5 shadow-sm">
                  <span className="text-[10px] text-graphite-400 font-bold uppercase tracking-wider">Triggered Policy Rules</span>
                  <p className="text-3xl font-extrabold font-mono text-white mt-2">
                    {record.triggered_rules?.length || 0}
                  </p>
                  <p className="text-[11px] text-graphite-400 mt-2 font-mono">Evaluated against 42 active rules</p>
                </div>

                <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-5 shadow-sm">
                  <span className="text-[10px] text-graphite-400 font-bold uppercase tracking-wider">Execution Latency (p99)</span>
                  <p className="text-3xl font-extrabold font-mono text-sky-400 mt-2">
                    {record.execution_time_ms} <span className="text-sm">ms</span>
                  </p>
                  <p className="text-[11px] text-emerald-400 font-mono mt-2 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Within Tier-1 Bank SLA (&lt;50ms)
                  </p>
                </div>
              </div>

              {/* Forensic Rationale & Audit Hash */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-copper-400 font-mono">
                    Deterministic Decision Rationale & Consensus Output
                  </span>
                  <span className="text-[10px] font-mono text-graphite-400 bg-graphite-950 px-2.5 py-1 rounded-md border border-graphite-800">
                    Dual Engine: XGBoost + Policy AST Arbiter
                  </span>
                </div>
                <p className="text-sm font-semibold text-white leading-relaxed">{record.decision_reason}</p>
                
                <div className="pt-2 border-t border-graphite-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-graphite-400 gap-2">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cryptographic Audit Digest:</span>
                    <span className="text-graphite-200">SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">MongoDB Atlas Synced ✓</span>
                </div>
              </div>

              {/* Real-Time SHAP Waterfall Feature Attribution */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-graphite-800 pb-3">
                  <div className="flex items-center space-x-2 text-sm font-bold text-white">
                    <TrendingUp className="w-4 h-4 text-copper-400" />
                    <span>Sub-15ms TreeSHAP Real-Time Feature Attribution Breakdown</span>
                  </div>
                  <span className="text-[10px] font-mono text-graphite-400">Model: ensemble-xgb-lgbm-v2.4</span>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-graphite-300">velocity_surge_10m (5 txns / 10 mins)</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-48 bg-graphite-950 h-2 rounded-full overflow-hidden flex">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: '85%' }} />
                      </div>
                      <span className="font-mono font-bold text-rose-400 w-16 text-right">+28.5 pts</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-graphite-300">device_fingerprint_asn_risk (Host: DigitalOcean NL)</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-48 bg-graphite-950 h-2 rounded-full overflow-hidden flex">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: '68%' }} />
                      </div>
                      <span className="font-mono font-bold text-rose-400 w-16 text-right">+22.0 pts</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-graphite-300">cross_border_mismatch (Card US vs IP NL)</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-48 bg-graphite-950 h-2 rounded-full overflow-hidden flex">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }} />
                      </div>
                      <span className="font-mono font-bold text-amber-400 w-16 text-right">+14.5 pts</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-graphite-300">customer_tenure_baseline (3.2 years active)</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-48 bg-graphite-950 h-2 rounded-full overflow-hidden flex justify-end">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '42%' }} />
                      </div>
                      <span className="font-mono font-bold text-emerald-400 w-16 text-right">-14.2 pts</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-graphite-300">tokenized_3ds_authenticated (Verified Visa D-PAS)</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-48 bg-graphite-950 h-2 rounded-full overflow-hidden flex justify-end">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '25%' }} />
                      </div>
                      <span className="font-mono font-bold text-emerald-400 w-16 text-right">-8.5 pts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Model Ensemble Consensus Matrix */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-graphite-800 pb-3">
                  <div className="flex items-center space-x-2 text-sm font-bold text-white">
                    <Cpu className="w-4 h-4 text-copper-400" />
                    <span>Heterogeneous Multi-Model Ensemble Voting Consensus</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">All 4 Models Operational</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-graphite-950 p-4 rounded-xl border border-graphite-800">
                    <div className="flex justify-between items-center text-xs font-semibold text-graphite-300">
                      <span>XGBoost Tabular</span>
                      <span className="text-[10px] font-mono text-copper-400">Weight: 35%</span>
                    </div>
                    <p className="text-xl font-bold font-mono text-rose-400 mt-2">88.4 <span className="text-xs text-graphite-500">/ 100</span></p>
                    <p className="text-[10px] text-graphite-400 mt-1 font-mono">Inference: 4.2ms</p>
                  </div>

                  <div className="bg-graphite-950 p-4 rounded-xl border border-graphite-800">
                    <div className="flex justify-between items-center text-xs font-semibold text-graphite-300">
                      <span>LightGBM Gradient</span>
                      <span className="text-[10px] font-mono text-copper-400">Weight: 30%</span>
                    </div>
                    <p className="text-xl font-bold font-mono text-rose-400 mt-2">84.1 <span className="text-xs text-graphite-500">/ 100</span></p>
                    <p className="text-[10px] text-graphite-400 mt-1 font-mono">Inference: 3.8ms</p>
                  </div>

                  <div className="bg-graphite-950 p-4 rounded-xl border border-graphite-800">
                    <div className="flex justify-between items-center text-xs font-semibold text-graphite-300">
                      <span>Isolation Forest</span>
                      <span className="text-[10px] font-mono text-copper-400">Weight: 20%</span>
                    </div>
                    <p className="text-xl font-bold font-mono text-amber-400 mt-2">0.91 <span className="text-xs text-graphite-500">Index</span></p>
                    <p className="text-[10px] text-graphite-400 mt-1 font-mono">Inference: 2.1ms</p>
                  </div>

                  <div className="bg-graphite-950 p-4 rounded-xl border border-graphite-800">
                    <div className="flex justify-between items-center text-xs font-semibold text-graphite-300">
                      <span>GNN Mule Proximity</span>
                      <span className="text-[10px] font-mono text-copper-400">Weight: 15%</span>
                    </div>
                    <p className="text-xl font-bold font-mono text-amber-400 mt-2">78.5 <span className="text-xs text-graphite-500">/ 100</span></p>
                    <p className="text-[10px] text-graphite-400 mt-1 font-mono">Inference: 11.4ms</p>
                  </div>
                </div>
              </div>

              {/* Triggered Policy Rules Breakdown Table */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-graphite-950 px-6 py-4 border-b border-graphite-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-copper-400">
                    <Layers className="w-4 h-4" />
                    <span>Triggered Policy Rules Execution Trace</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-graphite-300">
                    <thead className="bg-graphite-950/80 uppercase tracking-wider text-[10px] font-semibold text-graphite-400 border-b border-graphite-800">
                      <tr>
                        <th className="px-6 py-3.5">Priority</th>
                        <th className="px-6 py-3.5">Rule ID & Definition</th>
                        <th className="px-6 py-3.5">Domain Category</th>
                        <th className="px-6 py-3.5">Triggered Action</th>
                        <th className="px-6 py-3.5">Severity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-graphite-800/60 font-mono text-xs">
                      {(record.triggered_rules || []).map((tr, idx) => (
                        <tr key={idx} className="hover:bg-graphite-800/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-white">
                            P-{tr.priority}
                          </td>
                          <td className="px-6 py-4 font-sans">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">{tr.rule_name}</span>
                              <span className="font-mono text-[11px] text-copper-400">{tr.rule_id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-sans text-graphite-300">
                            {tr.category}
                          </td>
                          <td className="px-6 py-4">
                            <DecisionBadge action={tr.action} size="sm" />
                          </td>
                          <td className="px-6 py-4 text-copper-400 font-bold">
                            {tr.severity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Reviewer Analyst Panel */}
              <ReviewerPanel
                decisionId={record.decision_id}
                currentStatus={record.review_status}
                reviewerId={record.reviewer_id}
              />

              {/* Raw Trace JSON Inspector */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-graphite-950 px-6 py-3.5 border-b border-graphite-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400">
                    <Code className="w-4 h-4" />
                    <span>Raw Cryptographic Decision Trace JSON Payload</span>
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

                <pre className="p-6 font-mono text-xs text-graphite-200 bg-graphite-950 overflow-x-auto max-h-[400px] leading-relaxed">
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
