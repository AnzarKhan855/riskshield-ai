"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import {
  Sparkles,
  Search,
  Activity,
  Shield,
  Layers,
  Cpu,
  Zap,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Copy,
  Check,
  Send,
  Filter,
  BarChart3,
  Flame,
  Fingerprint,
  Users,
  Store,
  Smartphone,
  GitBranch,
} from "lucide-react";
import {
  useAICopilot,
  useNLSearch,
  useRootCauseAnalysis,
  useFraudPatterns,
  useDriftDetection,
  useFeatureImportance,
  useRiskRecommendations,
  useRuleSuggestions,
  useModelRecommendations,
  useCounterfactualSimulation,
  useScenarioTesting,
  useMerchantIntelligence,
  useCustomerIntelligence,
  useDeviceIntelligence,
} from "@/hooks/useAI";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type AITab =
  | "copilot"
  | "nl-search"
  | "rca"
  | "fraud-patterns"
  | "entities"
  | "drift"
  | "simulation"
  | "recommendations";

function EnterpriseAIHubContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as AITab) || "copilot";
  const initialTxn = searchParams.get("txn") || "TXN-ML-PRED-991";


  const [activeTab, setActiveTab] = useState<AITab>(initialTab);
  const [rcaTxnId, setRcaTxnId] = useState(initialTxn);
  const [rcaSearchQuery, setRcaSearchQuery] = useState(initialTxn);
  const { showToast } = useToast();

  useEffect(() => {
    const tab = searchParams.get("tab") as AITab;
    if (tab) setActiveTab(tab);
    const txn = searchParams.get("txn");
    if (txn) {
      setRcaTxnId(txn);
      setRcaSearchQuery(txn);
    }
  }, [searchParams]);

  // Tab navigation items
  const tabs = [
    { id: "copilot", label: "AI Copilot", icon: Sparkles, badge: "CORE" },
    { id: "nl-search", label: "NL Search", icon: Search },
    { id: "rca", label: "Root Cause (RCA)", icon: Activity },
    { id: "fraud-patterns", label: "Fraud Patterns", icon: Flame, badge: "NEW" },
    { id: "entities", label: "Entity 360°", icon: Users },
    { id: "drift", label: "Drift & SHAP", icon: BarChart3 },
    { id: "simulation", label: "Risk Simulation", icon: Sliders },
    { id: "recommendations", label: "Recommendations", icon: Zap },
  ];

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          {/* Header & Telemetry Ribbon */}
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-graphite-900 border border-graphite-800 p-4 sm:p-6 rounded-2xl shadow-xl w-full max-w-full overflow-hidden">
            <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-copper-500/20 to-graphite-950 border border-copper-500/40 flex items-center justify-center text-copper-400 font-bold shadow-lg shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-copper-400 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-2xl font-bold font-sans text-white truncate">
                    Enterprise <span className="text-copper-400">AI Intelligence</span> Hub
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-copper-500/10 text-copper-400 border border-copper-500/30 shrink-0">
                    REAL BACKEND API ENGINE
                  </span>
                </div>
                <p className="text-xs text-graphite-400 mt-1 leading-relaxed">
                  Conversational Copilot, Natural Language Search, Root Cause Forensics, Fraud Pattern Discovery, Drift Monitoring, and Scenario Simulation.
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono w-full xl:w-auto">
              <div className="bg-graphite-950 px-3 py-2 rounded-xl border border-graphite-800 flex flex-col items-start sm:items-end flex-1 xl:flex-initial">
                <span className="text-[10px] text-graphite-500 uppercase">Ensemble AUC-ROC</span>
                <span className="text-emerald-400 font-bold">0.9842 (STABLE)</span>
              </div>
              <div className="bg-graphite-950 px-3 py-2 rounded-xl border border-graphite-800 flex flex-col items-start sm:items-end flex-1 xl:flex-initial">
                <span className="text-[10px] text-graphite-500 uppercase">Overall PSI Drift</span>
                <span className="text-sky-400 font-bold">0.0412 (OPTIMAL)</span>
              </div>
            </div>
          </div>

          {/* Tab Selection Navigation */}
          <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar border-b border-graphite-800 pb-2 w-full max-w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AITab)}
                  className={cn(
                    "flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none",
                    isActive
                      ? "bg-copper-500 text-graphite-950 font-bold shadow-lg shadow-copper-500/20"
                      : "bg-graphite-900/60 border border-graphite-800 text-graphite-300 hover:bg-graphite-800 hover:text-white"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-graphite-950" : "text-copper-400")} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={cn(
                        "px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase",
                        isActive
                          ? "bg-graphite-950 text-copper-400"
                          : "bg-copper-500/10 text-copper-400 border border-copper-500/30"
                      )}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT PANELS */}
          {activeTab === "copilot" && <AICopilotTab />}
          {activeTab === "nl-search" && <NLSearchTab />}
          {activeTab === "rca" && (
            <RootCauseTab
              txnId={rcaTxnId}
              searchQuery={rcaSearchQuery}
              onSearchQueryChange={setRcaSearchQuery}
              onSearchSubmit={(val) => setRcaTxnId(val)}
            />
          )}
          {activeTab === "fraud-patterns" && <FraudPatternsTab />}
          {activeTab === "entities" && <EntityIntelligenceTab />}
          {activeTab === "drift" && <DriftAndFeatureImportanceTab />}
          {activeTab === "simulation" && <RiskSimulationTab />}
          {activeTab === "recommendations" && <RiskRecommendationsTab />}
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}

export default function EnterpriseAIHubPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-graphite-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-copper-400" />
        </div>
      }
    >
      <EnterpriseAIHubContent />
    </Suspense>
  );
}


// ============================================================================
// TAB 1: AI COPILOT WORKSPACE
// ============================================================================
function AICopilotTab() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<
    Array<{ sender: "user" | "ai"; text: string; evidence?: any; actions?: any[] }>
  >([
    {
      sender: "ai",
      text: "RiskShield AI Copilot ready. Ask questions about transactions, cases, active rules, ensemble drift, or fraud patterns.",
      actions: [
        { label: "Analyze TXN-ML-PRED-991", action: "SEND", target: "Analyze TXN-ML-PRED-991" },
        { label: "Check Model Ensemble Drift", action: "SEND", target: "What is the current model drift and PSI status?" },
        { label: "Suggest Rule for Velocity Spike", action: "SEND", target: "Suggest a rule for cross-border velocity bursts" },
      ],
    },
  ]);

  const copilot = useAICopilot();

  const handleSend = (text?: string) => {
    const q = (text || query).trim();
    if (!q || copilot.isPending) return;

    setHistory((prev) => [...prev, { sender: "user", text: q }]);
    if (!text) setQuery("");

    copilot.mutate(
      { query: q },
      {
        onSuccess: (data) => {
          setHistory((prev) => [
            ...prev,
            {
              sender: "ai",
              text: data.answer,
              evidence: data.evidence,
              actions: data.recommended_actions,
            },
          ]);
        },
      }
    );
  };

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-graphite-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-copper-400" />
            <span>Interactive Forensic Copilot</span>
          </h2>
          <p className="text-xs text-graphite-400">
            Natural language risk queries grounded in live transactions, policy rules, and multi-model predictions.
          </p>
        </div>
        <button
          onClick={() =>
            setHistory([
              {
                sender: "ai",
                text: "Session cleared. What would you like to investigate next?",
              },
            ])
          }
          className="text-xs text-graphite-400 hover:text-white flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-graphite-950 border border-graphite-800"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* Message Feed */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar p-2">
        {history.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col space-y-1.5 max-w-[85%]",
              msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <span className="text-[10px] font-mono text-graphite-500">
              {msg.sender === "user" ? "You (Lead Analyst)" : "RiskShield AI Copilot"}
            </span>
            <div
              className={cn(
                "p-4 rounded-xl text-xs leading-relaxed font-sans shadow-md",
                msg.sender === "user"
                  ? "bg-copper-500 text-graphite-950 font-medium"
                  : "bg-graphite-950 border border-graphite-800 text-graphite-200"
              )}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {msg.evidence && Object.keys(msg.evidence).length > 0 && (
                <div className="mt-3 p-2.5 rounded bg-graphite-900 border border-graphite-800 font-mono text-[11px] space-y-1">
                  <div className="text-[10px] font-bold text-copper-400 uppercase">
                    Forensic Grounding Data:
                  </div>
                  <pre className="overflow-x-auto text-[10px] text-graphite-300 p-1.5 rounded bg-black/40 max-h-36">
                    {JSON.stringify(msg.evidence, null, 2)}
                  </pre>
                </div>
              )}

              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-graphite-800 flex flex-wrap gap-1.5">
                  {msg.actions.map((act: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(act.target)}
                      className="px-2.5 py-1 rounded bg-copper-500/10 hover:bg-copper-500/20 text-copper-400 border border-copper-500/30 text-[11px] font-semibold transition-colors flex items-center space-x-1"
                    >
                      <span>{act.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {copilot.isPending && (
          <div className="flex items-center space-x-2 text-xs font-mono text-copper-400 p-3 bg-graphite-950 rounded-xl border border-graphite-800 w-fit animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Analyzing feature vectors and historical clusters...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center space-x-3 pt-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask Copilot (e.g. 'Analyze TXN-ML-PRED-991', 'Suggest rule for botnet', 'Check model drift')..."
          className="flex-1 bg-graphite-950 border border-graphite-700 focus:border-copper-400 rounded-xl px-4 py-3 text-xs text-white placeholder-graphite-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!query.trim() || copilot.isPending}
          className="px-6 py-3 bg-copper-500 hover:bg-copper-400 disabled:opacity-40 text-graphite-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// TAB 2: NATURAL LANGUAGE SEARCH
// ============================================================================
function NLSearchTab() {
  const [nlQuery, setNlQuery] = useState("Show blocked transactions over $500 in US");
  const nlSearch = useNLSearch();

  const presets = [
    "Show blocked transactions over $500 in US",
    "Critical priority open investigation cases",
    "Active policy rules for velocity limits",
    "High risk merchants in Retail",
    "Failed transactions with amount over $1000",
  ];

  const handleSearch = useCallback((qToSend?: string) => {
    const q = (qToSend || nlQuery).trim();
    if (!q) return;
    if (qToSend) setNlQuery(qToSend);
    nlSearch.mutate(q);
  }, [nlQuery, nlSearch]);

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="space-y-6">
      <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Search className="w-4 h-4 text-copper-400" />
            <span>Natural Language Enterprise Search Engine</span>
          </h2>
          <p className="text-xs text-graphite-400">
            Translates free-form queries into structured database queries across Transactions, Cases, Rules, Merchants, and Customers.
          </p>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex items-center space-x-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-copper-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              placeholder="e.g. 'Show critical cases opened today', 'Blocked transactions over $500 in GB'..."
              className="w-full bg-graphite-950 border border-graphite-700 focus:border-copper-400 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-graphite-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={nlSearch.isPending}
            className="px-6 py-3 bg-copper-500 hover:bg-copper-400 text-graphite-950 font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            Execute NL Search
          </button>
        </form>

        {/* Preset Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-[10px] font-mono text-graphite-500 uppercase self-center">Presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSearch(p)}
              className="px-2.5 py-1 rounded-lg bg-graphite-950 hover:bg-graphite-800 border border-graphite-800 text-[11px] text-graphite-300 hover:text-white transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Results Box */}
      {nlSearch.data && (
        <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-xl space-y-4">
          {/* Query Interpretation Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-graphite-950 border border-graphite-800">
            <div>
              <div className="text-[10px] font-mono font-bold text-copper-400 uppercase">
                Applied Structured Interpretation:
              </div>
              <p className="text-xs text-graphite-200 mt-0.5">{nlSearch.data.applied_interpretation}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 rounded bg-copper-500/10 text-copper-400 border border-copper-500/30 font-mono text-[10px] font-bold">
                Entity: {nlSearch.data.entity_type}
              </span>
              <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold">
                {nlSearch.data.matched_entities_count} Matched
              </span>
            </div>
          </div>

          {/* Results Table */}
          {nlSearch.data.results.length === 0 ? (
            <div className="p-8 text-center text-xs text-graphite-400">
              No entities matched the given natural language criteria in the live database.
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-graphite-800 text-[10px] font-mono uppercase text-graphite-400">
                    <th className="py-2.5 px-3">Entity Identifier</th>
                    <th className="py-2.5 px-3">Primary Attributes</th>
                    <th className="py-2.5 px-3">Status / Action</th>
                    <th className="py-2.5 px-3 text-right">Quick Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite-800 font-mono text-[11px]">
                  {nlSearch.data.results.map((r, idx) => (
                    <tr key={idx} className="hover:bg-graphite-800/40 transition-colors">
                      <td className="py-2.5 px-3 text-copper-400 font-bold">{r.entity_id}</td>
                      <td className="py-2.5 px-3 text-graphite-300 font-sans">
                        {r.amount ? `$${r.amount.toFixed(2)} ${r.currency} (${r.country})` : r.title || r.name || r.business_name || r.full_name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-graphite-800 border border-graphite-700 text-white">
                          {r.status || r.action || r.priority || "ACTIVE"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          href={
                            nlSearch.data?.entity_type === "CASE"
                              ? `/cases/${r.entity_id}`
                              : nlSearch.data?.entity_type === "RULE"
                              ? `/rules`
                              : `/transactions`
                          }
                          className="px-2 py-1 rounded bg-copper-500/10 hover:bg-copper-500/20 text-copper-400 border border-copper-500/30 text-[10px] font-semibold transition-colors inline-flex items-center space-x-1"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB 3: ROOT CAUSE ANALYSIS (RCA) & EXPLAINABILITY
// ============================================================================
function RootCauseTab({
  txnId,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
}: {
  txnId: string;
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  onSearchSubmit: (val: string) => void;
}) {
  const { data: rca, isLoading, error } = useRootCauseAnalysis(txnId);

  return (
    <div className="space-y-6">
      {/* Search Input for RCA */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Activity className="w-4 h-4 text-copper-400" />
            <span>Automated Root Cause Forensics & Causal Attribution</span>
          </h2>
          <p className="text-xs text-graphite-400">
            Computes baseline empirical z-scores, SHAP waterfall attributions, and mitigation guidance for flagged transactions.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit(searchQuery);
          }}
          className="flex items-center space-x-2 w-full sm:w-80"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Enter Transaction ID (e.g. TXN-001)..."
            className="flex-1 bg-graphite-950 border border-graphite-700 focus:border-copper-400 rounded-xl px-3 py-2 text-xs text-white placeholder-graphite-500 focus:outline-none font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-copper-500 hover:bg-copper-400 text-graphite-950 font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            Analyze
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-12 text-center text-xs text-copper-400 font-mono animate-pulse">
          Synthesizing multi-variable root cause attribution matrix...
        </div>
      ) : error || !rca ? (
        <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-12 text-center text-xs text-rose-400 font-mono">
          Transaction &quot;{txnId}&quot; could not be located in transaction history.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Decision Verdict & Summary */}
          <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-copper-400 font-bold">{rca.transaction_id}</span>
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border",
                  rca.decision === "BLOCK"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    : rca.decision === "REVIEW"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                )}
              >
                {rca.decision}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-graphite-950 border border-graphite-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-graphite-400 uppercase">Composite Risk Score</span>
                <div className="text-2xl font-bold font-mono text-white mt-0.5">
                  {rca.composite_risk_score.toFixed(1)}
                  <span className="text-xs text-graphite-500">/100</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-graphite-400 uppercase">Confidence</span>
                <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                  {(rca.confidence_score * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono font-bold text-copper-400 uppercase mb-1">
                Root Cause Forensic Narrative:
              </div>
              <p className="text-xs text-graphite-300 leading-relaxed font-sans">{rca.root_cause_summary}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-copper-500/10 border border-copper-500/30 space-y-1">
              <div className="text-[10px] font-mono font-bold text-copper-400 uppercase">
                Mitigation Action:
              </div>
              <p className="text-xs text-graphite-200">{rca.mitigation_recommendation}</p>
            </div>
          </div>

          {/* Right 2 Columns: Feature Deviations & Z-Scores */}
          <div className="lg:col-span-2 bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-copper-400" />
              <span>Statistical Feature Deviations & Contribution Waterfall</span>
            </h3>

            <div className="space-y-3">
              {rca.feature_deviations.map((dev, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white">{dev.feature}</span>
                      <span className="text-[10px] font-mono text-graphite-500 ml-2">({dev.feature_key})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-graphite-400">
                        Z-Score: <strong className={dev.z_score > 2 ? "text-rose-400" : "text-sky-400"}>{dev.z_score > 0 ? `+${dev.z_score}` : dev.z_score}σ</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-copper-500/10 text-copper-400 border border-copper-500/30">
                        {dev.contribution_pct}% Impact
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-graphite-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-copper-500 to-rose-500 rounded-full"
                      style={{ width: `${Math.min(100, dev.contribution_pct * 2)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-graphite-400">
                    <span>Actual: <strong className="text-white">{dev.actual_value}</strong></span>
                    <span>Population Baseline: {dev.baseline_mean}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB 4: FRAUD PATTERN DISCOVERY
// ============================================================================
function FraudPatternsTab() {
  const { data: patterns, isLoading } = useFraudPatterns(50);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Flame className="w-4 h-4 text-copper-400" />
            <span>Unsupervised Fraud Pattern Discovery & Active Clusters</span>
          </h2>
          <p className="text-xs text-graphite-400">
            Real-time clustering algorithms identify emerging attack patterns, card-testing rings, and botnet sequences.
          </p>
        </div>
        {patterns && (
          <div className="text-right font-mono text-xs">
            <span className="text-graphite-400 text-[10px] uppercase block">Total Monetary Exposure</span>
            <span className="text-rose-400 font-bold text-base">
              ${patterns.total_exposure_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-12 text-center text-xs text-copper-400 font-mono animate-pulse">
          Executing topology clustering across active transaction stream...
        </div>
      ) : !patterns || patterns.detected_patterns.length === 0 ? (
        <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-12 text-center text-xs text-graphite-400">
          No anomalous fraud clusters detected in the recent monitoring window.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {patterns.detected_patterns.map((cluster) => (
            <div
              key={cluster.cluster_id}
              className="bg-graphite-900 border border-graphite-800 hover:border-copper-500/50 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-copper-400 font-bold">{cluster.cluster_id}</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-mono font-bold border",
                      cluster.severity === "CRITICAL"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    )}
                  >
                    {cluster.severity}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white font-sans">{cluster.pattern_name}</h3>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-graphite-950 border border-graphite-800 font-mono text-[10px]">
                  <div>
                    <span className="text-graphite-500 block">Affected Txns</span>
                    <span className="text-white font-bold">{cluster.affected_transactions_count}</span>
                  </div>
                  <div>
                    <span className="text-graphite-500 block">Exposed USD</span>
                    <span className="text-rose-400 font-bold">${cluster.exposed_amount_usd.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-graphite-400 uppercase">Key Indicators:</span>
                  <ul className="text-xs text-graphite-300 space-y-1 list-disc list-inside">
                    {cluster.indicators.map((ind, idx) => (
                      <li key={idx} className="truncate">{ind}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Auto-Defense Rule */}
              <div className="pt-3 border-t border-graphite-800 space-y-2">
                <div className="text-[10px] font-mono font-bold text-copper-400 uppercase flex items-center justify-between">
                  <span>Synthesized Defense Rule:</span>
                  <span className="text-emerald-400">{cluster.suggested_rule.estimated_precision} Prec</span>
                </div>
                <pre className="text-[10px] text-graphite-300 bg-graphite-950 p-2 rounded-lg border border-graphite-800 overflow-x-auto">
                  {cluster.suggested_rule.expression}
                </pre>
                <button
                  onClick={() => router.push("/rules")}
                  className="w-full py-2 bg-copper-500/10 hover:bg-copper-500/20 text-copper-400 border border-copper-500/30 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-1"
                >
                  <span>Deploy to Rule Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB 5: 360° ENTITY INTELLIGENCE
// ============================================================================
function EntityIntelligenceTab() {
  const [entityType, setEntityType] = useState<"merchant" | "customer" | "device">("merchant");
  const [targetId, setTargetId] = useState("MRC-A9B1C2");

  const merchantIntel = useMerchantIntelligence(entityType === "merchant" ? targetId : undefined);
  const customerIntel = useCustomerIntelligence(entityType === "customer" ? targetId : undefined);
  const deviceIntel = useDeviceIntelligence(entityType === "device" ? targetId : undefined);

  const presets = {
    merchant: ["MRC-A9B1C2", "MRC-PROD-01", "MRC-GLOBAL-PAY"],
    customer: ["CUST-10491A", "CUST-88301B", "CUST-49201C"],
    device: ["DEV-FP-8F92A101", "DEV-FP-33B10C", "DEV-FP-99AA12"],
  };

  return (
    <div className="space-y-6">
      <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-copper-400" />
              <span>360-Degree Entity AI Intelligence Explorer</span>
            </h2>
            <p className="text-xs text-graphite-400">
              Deep forensic profiles for Merchants, Customers, and Device Telemetry.
            </p>
          </div>

          {/* Entity Type Switcher */}
          <div className="flex items-center space-x-1 bg-graphite-950 p-1 rounded-xl border border-graphite-800">
            <button
              onClick={() => {
                setEntityType("merchant");
                setTargetId(presets.merchant[0]);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5",
                entityType === "merchant" ? "bg-copper-500 text-graphite-950 font-bold" : "text-graphite-300 hover:text-white"
              )}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Merchants</span>
            </button>
            <button
              onClick={() => {
                setEntityType("customer");
                setTargetId(presets.customer[0]);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5",
                entityType === "customer" ? "bg-copper-500 text-graphite-950 font-bold" : "text-graphite-300 hover:text-white"
              )}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Customers</span>
            </button>
            <button
              onClick={() => {
                setEntityType("device");
                setTargetId(presets.device[0]);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5",
                entityType === "device" ? "bg-copper-500 text-graphite-950 font-bold" : "text-graphite-300 hover:text-white"
              )}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Devices</span>
            </button>
          </div>
        </div>

        {/* Search Preset Inputs */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder={`Enter ${entityType} ID...`}
            className="w-72 bg-graphite-950 border border-graphite-700 focus:border-copper-400 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
          />
          {presets[entityType].map((p, i) => (
            <button
              key={i}
              onClick={() => setTargetId(p)}
              className="px-2.5 py-1.5 rounded-lg bg-graphite-950 border border-graphite-800 text-[10px] font-mono text-graphite-300 hover:text-white"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Intelligence Payload View */}
      {entityType === "merchant" && merchantIntel.data && (
        <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-graphite-800 pb-4">
            <div>
              <span className="text-xs font-mono text-copper-400 font-bold">{merchantIntel.data.merchant_code}</span>
              <h3 className="text-lg font-bold text-white">{merchantIntel.data.business_name}</h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-copper-500/10 text-copper-400 border border-copper-500/30 font-mono text-xs font-bold">
              {merchantIntel.data.underwriting_tier}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800">
              <span className="text-[10px] font-mono text-graphite-500 uppercase">AI Risk Score</span>
              <div className="text-xl font-bold font-mono text-white mt-1">{merchantIntel.data.ai_risk_score} / 100</div>
            </div>
            <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800">
              <span className="text-[10px] font-mono text-graphite-500 uppercase">Chargeback Ratio</span>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {(merchantIntel.data.chargeback_ratio * 100).toFixed(2)}%
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800">
              <span className="text-[10px] font-mono text-graphite-500 uppercase">Processed Volume</span>
              <div className="text-xl font-bold font-mono text-white mt-1">${merchantIntel.data.total_volume_usd.toLocaleString()}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800">
              <span className="text-[10px] font-mono text-graphite-500 uppercase">Transaction Count</span>
              <div className="text-xl font-bold font-mono text-sky-400 mt-1">{merchantIntel.data.transaction_count}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-graphite-950 border border-graphite-800">
            <div className="text-[10px] font-mono font-bold text-copper-400 uppercase mb-1">AI Underwriting Assessment:</div>
            <p className="text-xs text-graphite-300 leading-relaxed font-sans">{merchantIntel.data.ai_underwriting_summary}</p>
          </div>
        </div>
      )}

      {entityType === "customer" && customerIntel.data && (
        <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-graphite-800 pb-4">
            <div>
              <span className="text-xs font-mono text-copper-400 font-bold">{customerIntel.data.customer_id}</span>
              <h3 className="text-lg font-bold text-white">{customerIntel.data.full_name}</h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold">
              Trust Score: {customerIntel.data.trust_score}/100
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800">
              <span className="text-[10px] font-mono text-graphite-500 uppercase">Fraud Probability</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {(customerIntel.data.fraud_probability * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800">
              <span className="text-[10px] font-mono text-graphite-500 uppercase">Total Spend</span>
              <div className="text-xl font-bold font-mono text-white mt-1">${customerIntel.data.total_spend_usd.toLocaleString()}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800">
              <span className="text-[10px] font-mono text-graphite-500 uppercase">Distinct Devices</span>
              <div className="text-xl font-bold font-mono text-sky-400 mt-1">{customerIntel.data.distinct_devices_count}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800">
              <span className="text-[10px] font-mono text-graphite-500 uppercase">Synthetic ID Risk</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{customerIntel.data.synthetic_identity_risk_score} / 100</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-graphite-950 border border-graphite-800">
            <div className="text-[10px] font-mono font-bold text-copper-400 uppercase mb-1">Behavioral Synthesis:</div>
            <p className="text-xs text-graphite-300 leading-relaxed font-sans">{customerIntel.data.behavioral_summary}</p>
          </div>
        </div>
      )}

      {entityType === "device" && deviceIntel.data && (
        <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-graphite-800 pb-4">
            <div>
              <span className="text-xs font-mono text-copper-400 font-bold">{deviceIntel.data.device_fingerprint}</span>
              <h3 className="text-lg font-bold text-white">{deviceIntel.data.operating_system} &bull; {deviceIntel.data.browser}</h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-copper-500/10 text-copper-400 border border-copper-500/30 font-mono text-xs font-bold">
              Threat: {deviceIntel.data.threat_level}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800">
              <span className="text-[10px] font-mono text-graphite-500 uppercase">Device Trust</span>
              <div className="text-xl font-bold font-mono text-white mt-1">{deviceIntel.data.trust_score} / 100</div>
            </div>
            <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800">
              <span className="text-[10px] font-mono text-graphite-500 uppercase">VPN / Proxy</span>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">{deviceIntel.data.vpn_detected ? "DETECTED" : "CLEAR"}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800">
              <span className="text-[10px] font-mono text-graphite-500 uppercase">Root / Jailbreak</span>
              <div className="text-xl font-bold font-mono text-white mt-1">{deviceIntel.data.rooted_device ? "YES" : "NO"}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800">
              <span className="text-[10px] font-mono text-graphite-500 uppercase">Linked Accounts</span>
              <div className="text-xl font-bold font-mono text-sky-400 mt-1">{deviceIntel.data.linked_accounts_count}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-graphite-950 border border-graphite-800">
            <div className="text-[10px] font-mono font-bold text-copper-400 uppercase mb-1">Device Forensic Telemetry:</div>
            <p className="text-xs text-graphite-300 leading-relaxed font-sans">{deviceIntel.data.forensic_summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB 6: DRIFT DETECTION & GLOBAL FEATURE IMPORTANCE
// ============================================================================
function DriftAndFeatureImportanceTab() {
  const { data: drift } = useDriftDetection();
  const { data: shap } = useFeatureImportance();

  return (
    <div className="space-y-6">
      {/* Drift Summary */}
      {drift && (
        <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-graphite-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-copper-400" />
                <span>Ensemble Population Stability Index (PSI) Drift Monitor</span>
              </h2>
              <p className="text-xs text-graphite-400">
                Measures statistical distribution shifts between training baseline and real-time production inference.
              </p>
            </div>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-mono font-bold border",
                drift.overall_drift_status === "STABLE"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              )}
            >
              Overall PSI: {drift.overall_psi} ({drift.overall_drift_status})
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-graphite-800 text-[10px] font-mono uppercase text-graphite-400">
                  <th className="py-2.5 px-3">Feature Name</th>
                  <th className="py-2.5 px-3">Baseline Mean</th>
                  <th className="py-2.5 px-3">Production Mean</th>
                  <th className="py-2.5 px-3">Feature PSI</th>
                  <th className="py-2.5 px-3 text-right">Drift Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-800 font-mono text-[11px]">
                {drift.feature_drift_breakdown.map((f, i) => (
                  <tr key={i} className="hover:bg-graphite-800/40">
                    <td className="py-2.5 px-3 font-semibold text-white font-sans">{f.feature}</td>
                    <td className="py-2.5 px-3 text-graphite-400">{f.baseline_mean}</td>
                    <td className="py-2.5 px-3 text-copper-400 font-bold">{f.current_mean}</td>
                    <td className="py-2.5 px-3">{f.psi}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-mono font-bold",
                          f.status === "STABLE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        )}
                      >
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Global SHAP Feature Importance */}
      {shap && (
        <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-graphite-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-copper-400" />
                <span>Global Ensemble Feature Importance & Mean Absolute SHAP</span>
              </h2>
              <p className="text-xs text-graphite-400">{shap.explanation_methodology}</p>
            </div>
          </div>

          <div className="space-y-3">
            {shap.global_feature_importance.map((f, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-white">{f.feature_name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-graphite-800 text-graphite-400 font-mono text-[9px]">
                      {f.category}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-copper-400">
                    SHAP: {f.shap_mean_abs.toFixed(2)} ({(f.importance_score * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-graphite-800 overflow-hidden">
                  <div
                    className="h-full bg-copper-500 rounded-full"
                    style={{ width: `${f.importance_score * 100 * 2.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB 7: RISK SIMULATION & SCENARIO TESTING
// ============================================================================
function RiskSimulationTab() {
  const [selectedScenario, setSelectedScenario] = useState("HOLIDAY_VELOCITY_SURGE");
  const scenarioMutation = useScenarioTesting();

  // Counterfactual state
  const [simTxnId, setSimTxnId] = useState("TXN-ML-PRED-991");
  const [simAmount, setSimAmount] = useState(850.0);
  const [simVelocity, setSimVelocity] = useState(4);
  const [sim3DS, setSim3DS] = useState(false);
  const [simVpn, setSimVpn] = useState(true);
  const counterfactualMutation = useCounterfactualSimulation();

  useEffect(() => {
    scenarioMutation.mutate({ scenario_type: selectedScenario });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScenario]);


  const handleRunCounterfactual = () => {
    counterfactualMutation.mutate({
      transaction_id: simTxnId,
      modifications: {
        txn_amount: simAmount,
        velocity_1h: simVelocity,
        is_3ds_verified: sim3DS,
        vpn_active: simVpn,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Macro Scenario Stress Testing */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-graphite-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-copper-400" />
              <span>Macro Attack Scenario Stress-Testing</span>
            </h2>
            <p className="text-xs text-graphite-400">
              Simulate enterprise attack vectors and traffic surges to validate decision engine resilience.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {[
              { id: "HOLIDAY_VELOCITY_SURGE", label: "Holiday Surge" },
              { id: "BOTNET_CARD_TESTING", label: "Botnet Attack" },
              { id: "CROSS_BORDER_BIN_ATTACK", label: "Cross-Border Wave" },
              { id: "SYNTHETIC_IDENTITY_WAVE", label: "Synthetic ID" },
            ].map((sc) => (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors",
                  selectedScenario === sc.id
                    ? "bg-copper-500 text-graphite-950 font-bold"
                    : "bg-graphite-950 border border-graphite-800 text-graphite-300 hover:text-white"
                )}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {scenarioMutation.data && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-graphite-950 border border-graphite-800">
              <h3 className="text-sm font-bold text-white">{scenarioMutation.data.scenario_name}</h3>
              <p className="text-xs text-graphite-300 mt-1">{scenarioMutation.data.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800">
                <span className="text-[10px] font-mono text-graphite-500 uppercase">Projected Approval</span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {scenarioMutation.data.simulation_results.projected_approval_pct}%
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800">
                <span className="text-[10px] font-mono text-graphite-500 uppercase">Projected Block</span>
                <div className="text-xl font-bold font-mono text-rose-400 mt-1">
                  {scenarioMutation.data.simulation_results.projected_block_pct}%
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800">
                <span className="text-[10px] font-mono text-graphite-500 uppercase">Prevented Loss</span>
                <div className="text-xl font-bold font-mono text-copper-400 mt-1">
                  ${scenarioMutation.data.simulation_results.projected_prevented_loss_usd.toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800">
                <span className="text-[10px] font-mono text-graphite-500 uppercase">p99 Latency</span>
                <div className="text-xl font-bold font-mono text-sky-400 mt-1">
                  {scenarioMutation.data.simulation_results.latency_p99_ms}ms
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Real-Time Counterfactual Sandbox */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="border-b border-graphite-800 pb-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-copper-400" />
            <span>Counterfactual &quot;What-If&quot; Perturbation Sandbox</span>
          </h2>
          <p className="text-xs text-graphite-400">
            Perturb specific transaction features to observe exact risk score delta and decision boundary shifts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4 p-4 rounded-xl bg-graphite-950 border border-graphite-800">
            <div>
              <label className="text-[10px] font-mono text-graphite-400 uppercase block mb-1">Target Transaction ID</label>
              <input
                type="text"
                value={simTxnId}
                onChange={(e) => setSimTxnId(e.target.value)}
                className="w-full bg-graphite-900 border border-graphite-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-graphite-400 uppercase block mb-1">
                Simulated Amount (${simAmount})
              </label>
              <input
                type="range"
                min="10"
                max="5000"
                step="50"
                value={simAmount}
                onChange={(e) => setSimAmount(Number(e.target.value))}
                className="w-full accent-copper-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-graphite-400 uppercase block mb-1">
                1-Hour Velocity ({simVelocity} txns)
              </label>
              <input
                type="range"
                min="1"
                max="15"
                value={simVelocity}
                onChange={(e) => setSimVelocity(Number(e.target.value))}
                className="w-full accent-copper-500"
              />
            </div>

            <div className="flex items-center space-x-6 pt-1">
              <label className="flex items-center space-x-2 text-xs text-graphite-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sim3DS}
                  onChange={(e) => setSim3DS(e.target.checked)}
                  className="rounded border-graphite-700 text-copper-500 focus:ring-0"
                />
                <span>3DS Verified</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-graphite-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simVpn}
                  onChange={(e) => setSimVpn(e.target.checked)}
                  className="rounded border-graphite-700 text-copper-500 focus:ring-0"
                />
                <span>VPN / Proxy Active</span>
              </label>
            </div>

            <button
              onClick={handleRunCounterfactual}
              disabled={counterfactualMutation.isPending}
              className="w-full py-2.5 bg-copper-500 hover:bg-copper-400 text-graphite-950 font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              Run Counterfactual Simulation
            </button>
          </div>

          {/* Verdict Output */}
          <div className="p-5 rounded-xl bg-graphite-950 border border-graphite-800 flex flex-col justify-between">
            {counterfactualMutation.data ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-graphite-500 uppercase block">Original Score</span>
                    <span className="text-xl font-bold font-mono text-white">
                      {counterfactualMutation.data.original_state.risk_score} ({counterfactualMutation.data.original_state.decision})
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-copper-400" />
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-graphite-500 uppercase block">Simulated Score</span>
                    <span className="text-xl font-bold font-mono text-copper-400">
                      {counterfactualMutation.data.counterfactual_state.risk_score} ({counterfactualMutation.data.counterfactual_state.decision})
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-graphite-900 border border-graphite-800">
                  <span className="text-[10px] font-mono font-bold text-copper-400 uppercase block mb-1">
                    Simulation Verdict:
                  </span>
                  <p className="text-xs text-graphite-200 leading-relaxed font-sans">
                    {counterfactualMutation.data.simulation_verdict}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-8 text-xs text-graphite-500 font-mono">
                Adjust the sliders and click &quot;Run Counterfactual Simulation&quot; to test risk transitions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB 8: RISK RECOMMENDATIONS & RULE SUGGESTIONS
// ============================================================================
function RiskRecommendationsTab() {
  const { data: recs } = useRiskRecommendations();
  const { data: rules } = useRuleSuggestions();
  const { data: models } = useModelRecommendations();
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* System Recommendations */}
      {recs && (
        <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-graphite-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-copper-400" />
              <span>Proactive Risk & Policy Recommendations</span>
            </h2>
            <p className="text-xs text-graphite-400">
              System-generated recommendations based on recent transaction velocity and merchant exposure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recs.recommendations.map((rec: any) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl bg-graphite-950 border border-graphite-800 space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-copper-400 font-bold">{rec.id}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-copper-500/10 text-copper-400 border border-copper-500/30">
                      {rec.priority}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white">{rec.title}</h3>
                  <p className="text-[11px] text-graphite-400 leading-relaxed font-sans">{rec.rationale}</p>
                </div>
                <div className="pt-2 border-t border-graphite-800">
                  <span className="text-[10px] font-mono text-emerald-400 block font-semibold">
                    {rec.projected_impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Governance Advice */}
      {models && (
        <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-graphite-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-copper-400" />
              <span>AI Ensemble Governance & Model Recommendations</span>
            </h2>
            <p className="text-xs text-graphite-400">
              Champion/Challenger monitoring and ensemble weight rebalancing guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.recommendations.map((mod: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-graphite-950 border border-graphite-800 space-y-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  {mod.action}
                </span>
                <p className="text-xs text-graphite-300 font-sans">{mod.description}</p>
                <span className="text-[10px] font-mono text-graphite-500 block">Confidence: {(mod.confidence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
