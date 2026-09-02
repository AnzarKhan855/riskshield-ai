"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import EvidenceCenter from "@/components/cases/EvidenceCenter";
import InvestigationTimeline from "@/components/cases/InvestigationTimeline";
import AnalystNotes from "@/components/cases/AnalystNotes";
import ResolutionPanel from "@/components/cases/ResolutionPanel";
import { useCaseWorkspace, useAssignCase } from "@/hooks/useCases";
import { useCaseSummary, useGenerateCaseSummary } from "@/hooks/useAI";
import { useAuthStore } from "@/store/useAuthStore";
import { ShieldAlert, ArrowLeft, Code, Copy, Check, AlertCircle, UserCheck, Layers, Clock, CheckCircle2, Sparkles, Bot, Zap } from "lucide-react";

import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface InvestigationWorkspacePageProps {
  params: { id: string };
}

export default function InvestigationWorkspacePage({ params }: InvestigationWorkspacePageProps) {
  const { id } = params;
  const { user } = useAuthStore();
  const { data: workspace, isLoading, error } = useCaseWorkspace(id);
  const assignMutation = useAssignCase();
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleSelfAssign = () => {
    if (workspace?.case_details) {
      const analystId = user?.id || "00000000-0000-0000-0000-000000000001";
      const analystName = user ? `${user.first_name} ${user.last_name}` : "Lead Risk Analyst";
      assignMutation.mutate({
        id: workspace.case_details.case_id,
        analystId,
        analystName,
      });
    }
  };

  const handleCopyJson = () => {
    if (workspace) {
      navigator.clipboard.writeText(JSON.stringify(workspace, null, 2));
      setCopied(true);
      showToast("Full workspace payload copied to clipboard!", "info");
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
          ) : error || !workspace ? (
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Investigation Case Not Found</h2>
              <p className="text-xs text-graphite-400">
                The requested case workspace <span className="font-mono text-copper-400">{id}</span> could not be located.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Workspace Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <Link
                    href="/cases"
                    className="p-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 hover:text-copper-400 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h1 className="text-2xl font-bold font-mono text-copper-400">
                        {workspace.case_details.case_id}
                      </h1>
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border",
                          workspace.case_details.priority === "CRITICAL"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        )}
                      >
                        {workspace.case_details.priority} PRIORITY
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-graphite-800 border border-graphite-700 text-white font-mono text-xs">
                        {workspace.case_details.status}
                      </span>
                    </div>
                    <p className="text-xs text-graphite-400 mt-0.5">
                      Category: <span className="font-mono text-white">{workspace.case_details.category}</span> &bull; Opened {new Date(workspace.case_details.opened_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSelfAssign}
                  disabled={assignMutation.isPending}
                  className="px-4 py-2 bg-copper-500 hover:bg-copper-400 text-graphite-950 font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
                >
                  <UserCheck className="w-4 h-4 fill-graphite-950" />
                  <span>{workspace.case_details.assigned_analyst_name ? `Assigned: ${workspace.case_details.assigned_analyst_name}` : "Assign to Me"}</span>
                </button>
              </div>

              {/* Case Title Banner */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-copper-400">Case Investigation Title</span>
                <h2 className="text-lg font-bold text-white">{workspace.case_details.case_title}</h2>
                {workspace.case_details.case_description && (
                  <p className="text-xs text-graphite-300 mt-1">{workspace.case_details.case_description}</p>
                )}
              </div>

              {/* Linked Decision & Transaction Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Decision Summary */}
                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-graphite-800 pb-2">
                    <span className="text-xs font-semibold text-copper-400 uppercase tracking-wider">Linked Decision Intelligence</span>
                    <span className="font-mono text-xs text-graphite-400">{workspace.case_details.decision_id || "N/A"}</span>
                  </div>

                  {workspace.decision_summary ? (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-graphite-400">Decision Outcome:</span>
                        <span className="font-bold text-rose-400">{workspace.decision_summary.decision}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-graphite-400">Composite Risk Score:</span>
                        <span className="font-bold text-white">{workspace.decision_summary.composite_risk_score.toFixed(1)} / 100</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-graphite-400">Primary Reason:</span>
                        <span className="text-graphite-200 font-sans truncate max-w-xs">{workspace.decision_summary.reason}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-graphite-400 italic">No decision intelligence payload attached.</p>
                  )}
                </div>

                {/* Transaction Summary */}
                <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-graphite-800 pb-2">
                    <span className="text-xs font-semibold text-copper-400 uppercase tracking-wider">Target Transaction Summary</span>
                    <span className="font-mono text-xs text-white">{workspace.case_details.transaction_id}</span>
                  </div>

                  {workspace.transaction_summary ? (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-graphite-400">Amount & Currency:</span>
                        <span className="font-bold text-white">${workspace.transaction_summary.amount.toFixed(2)} {workspace.transaction_summary.currency}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-graphite-400">Payment Method:</span>
                        <span className="text-graphite-200">{workspace.transaction_summary.payment_method} ({workspace.transaction_summary.card_network})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-graphite-400">Origin Country:</span>
                        <span className="text-graphite-200">{workspace.transaction_summary.country}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-graphite-400 italic">Transaction details pending resolution.</p>
                  )}
                </div>
              </div>

              {/* AI Investigation Dossier Section */}
              <AICaseSummarySection caseId={workspace.case_details.case_id} />

              {/* Evidence Center Component */}
              <EvidenceCenter evidenceList={workspace.evidence_list || []} />


              {/* Analyst Case Resolution Panel */}
              <ResolutionPanel
                caseId={workspace.case_details.case_id}
                currentStatus={workspace.case_details.status}
                currentResolution={workspace.case_details.resolution}
              />

              {/* Analyst Notes & Commenting Component */}
              <AnalystNotes
                caseId={workspace.case_details.case_id}
                commentsList={workspace.comments_list || []}
              />

              {/* Investigation Timeline Component */}
              <InvestigationTimeline timelineList={workspace.timeline_list || []} />

              {/* Raw Workspace Payload Inspector */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-graphite-950 px-5 py-3 border-b border-graphite-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400">
                    <Code className="w-4 h-4" />
                    <span>Raw Workspace Payload JSON</span>
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
                  {JSON.stringify(workspace, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}

function AICaseSummarySection({ caseId }: { caseId: string }) {
  const { data: summary, isLoading } = useCaseSummary(caseId);
  const generateMutation = useGenerateCaseSummary();
  const { showToast } = useToast();

  const handleSynthesize = () => {
    generateMutation.mutate(caseId, {
      onSuccess: () => {
        showToast("AI Investigation Dossier synthesized successfully!", "info");
      },
    });
  };

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-graphite-800 pb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-copper-400" />
          <span className="text-xs font-semibold text-copper-400 uppercase tracking-wider">
            AI Investigation Dossier & Causal Synthesis
          </span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-copper-500/10 text-copper-400 border border-copper-500/30">
            ENTERPRISE AI
          </span>
        </div>

        <button
          onClick={handleSynthesize}
          disabled={generateMutation.isPending}
          className="px-3 py-1.5 bg-copper-500 hover:bg-copper-400 disabled:opacity-40 text-graphite-950 font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{summary ? "Regenerate Dossier" : "Synthesize AI Dossier"}</span>
        </button>
      </div>

      {isLoading || generateMutation.isPending ? (
        <div className="p-6 text-center text-xs font-mono text-copper-400 animate-pulse">
          Synthesizing multi-source timeline, linked transactions, and suspect activity...
        </div>
      ) : summary ? (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800 space-y-2">
            <span className="text-[10px] font-mono font-bold text-copper-400 uppercase">
              Executive Investigation Summary:
            </span>
            <p className="text-xs text-graphite-200 leading-relaxed font-sans">{summary.executive_summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800 space-y-2">
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">
                Key Identified Risk Factors:
              </span>
              <ul className="space-y-1.5">
                {summary.key_risk_factors.map((f, i) => (
                  <li key={i} className="text-xs text-graphite-300 flex items-start space-x-2">
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 text-[9px] font-mono font-bold mt-0.5">
                      {f.severity}
                    </span>
                    <span>
                      <strong className="text-white">{f.factor}:</strong> {f.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800 space-y-2">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                Recommended Investigator Actions:
              </span>
              <ul className="space-y-1.5">
                {summary.recommended_investigator_actions.map((act, i) => (
                  <li key={i} className="text-xs text-graphite-300 flex items-start space-x-2">
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold mt-0.5">
                      {act.action}
                    </span>
                    <span className="text-graphite-200">{act.recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {summary.sar_filing_recommended && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 font-bold">
                ⚠️ SAR FILING TRIGGER: Transaction patterns warrant FinCEN Suspicious Activity Report (SAR).
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500 text-graphite-950 font-bold text-[10px]">
                COMPLIANCE ADVISORY
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-graphite-400">
          Click &quot;Synthesize AI Dossier&quot; to generate an automated executive forensic analysis for this case.
        </div>
      )}
    </div>
  );
}

