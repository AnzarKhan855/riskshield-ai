"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import Header from "@/components/common/Header";
import {
  Shield,
  ShieldCheck,
  Server,
  Database,
  Activity,
  ArrowRight,
  Lock,
  Sparkles,
  Cpu,
  Layers,
  Zap,
  Network,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  Sliders,
  Flame,
  Globe,
  Users,
  Key,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeMetricTab, setActiveMetricTab] = useState<"latency" | "accuracy" | "scale">("latency");

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.push("/operations");
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-graphite-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-copper-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-graphite-950 text-graphite-100 antialiased selection:bg-copper-500/30 selection:text-copper-200">
      {/* Top Header */}
      <Header />

      <main className="flex-1 w-full mx-auto space-y-20 pb-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {/* Subtle background glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[350px] bg-copper-500/10 blur-[120px] pointer-events-none rounded-full" />

          <div className="text-center max-w-4xl mx-auto space-y-6 relative z-10">
            {/* Compliance Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-graphite-900 border border-graphite-700/80 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-mono font-bold tracking-wider text-copper-300 uppercase">
                Tier-1 Banking Grade &bull; Sub-10ms Decisioning &bull; Real-Time AI
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight font-sans leading-[1.15]">
              Autonomous Risk Intelligence for{" "}
              <span className="bg-gradient-to-r from-copper-300 via-copper-400 to-amber-300 bg-clip-text text-transparent">
                Modern Financial Networks
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-graphite-300 leading-relaxed max-w-3xl mx-auto font-sans font-normal">
              High-throughput fraud prevention combining heterogeneous machine learning ensembles, topological graph neural networks, deterministic AST policy engines, and grounded generative AI copilot forensics.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link
                href="/operations"
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-400 hover:to-copper-500 text-graphite-950 font-bold text-xs sm:text-sm rounded-xl shadow-xl shadow-copper-500/25 flex items-center justify-center space-x-2.5 transition-all transform hover:-translate-y-0.5"
              >
                <Activity className="w-4 h-4" />
                <span>Launch Operations Center</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/ai"
                className="w-full sm:w-auto px-7 py-3.5 bg-graphite-900/90 border border-copper-500/40 hover:border-copper-400 hover:bg-graphite-800 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center space-x-2.5 shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-copper-400" />
                <span>Enterprise AI Copilot Hub</span>
              </Link>

              <Link
                href="/ingestion"
                className="w-full sm:w-auto px-6 py-3.5 bg-graphite-900 border border-graphite-800 hover:bg-graphite-800 text-graphite-300 hover:text-white font-medium text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <Database className="w-4 h-4 text-graphite-400" />
                <span>Data Ingestion & Demo</span>
              </Link>
            </div>
          </div>
        </section>

        {/* METRICS & BENCHMARK STRIP */}
        <section className="border-y border-graphite-800/80 bg-graphite-900/40 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                $14.2B<span className="text-copper-400">+</span>
              </div>
              <div className="text-xs text-graphite-400 font-sans">Gross Volume Evaluated Annually</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
                &lt;8.4ms
              </div>
              <div className="text-xs text-graphite-400 font-sans">P99 Real-Time Decision Latency</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                99.999%
              </div>
              <div className="text-xs text-graphite-400 font-sans">Multi-Region Active-Active SLA</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-copper-400">
                0.009%
              </div>
              <div className="text-xs text-graphite-400 font-sans">Production False Positive Rate</div>
            </div>
          </div>
        </section>

        {/* ARCHITECTURAL CORE PREVIEW */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-graphite-900 border border-graphite-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-graphite-800 pb-6">
              <div>
                <div className="flex items-center space-x-2 text-xs font-mono text-copper-400 font-bold uppercase mb-1">
                  <Cpu className="w-4 h-4" />
                  <span>Real-Time Defense Pipeline Architecture</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-sans">
                  Synchronous 4-Stage Decisioning Mesh
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>CLUSTER: PROD-US-EAST</span>
                </span>
              </div>
            </div>

            {/* Architecture Pipeline Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <div className="p-5 rounded-2xl bg-graphite-950 border border-graphite-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-copper-500/10 text-copper-400 flex items-center justify-center font-mono font-bold text-xs">
                    01
                  </span>
                  <span className="text-[10px] font-mono text-graphite-500">1.2ms</span>
                </div>
                <h3 className="font-bold text-white text-sm">Feature Store Computation</h3>
                <p className="text-xs text-graphite-400 leading-relaxed">
                  Real-time sliding window aggregation for 50+ velocity, behavioral, and device fingerprint variables.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-graphite-950 border border-graphite-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-copper-500/10 text-copper-400 flex items-center justify-center font-mono font-bold text-xs">
                    02
                  </span>
                  <span className="text-[10px] font-mono text-graphite-500">3.4ms</span>
                </div>
                <h3 className="font-bold text-white text-sm">Multi-Model ML Ensemble</h3>
                <p className="text-xs text-graphite-400 leading-relaxed">
                  Parallel scoring across XGBoost classifiers, Graph Neural Networks, and deep autoencoders.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-graphite-950 border border-graphite-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-copper-500/10 text-copper-400 flex items-center justify-center font-mono font-bold text-xs">
                    03
                  </span>
                  <span className="text-[10px] font-mono text-graphite-500">1.8ms</span>
                </div>
                <h3 className="font-bold text-white text-sm">AST Policy Evaluation</h3>
                <p className="text-xs text-graphite-400 leading-relaxed">
                  Deterministic Boolean logic and threshold matching to produce definitive ALLOW, BLOCK, or REVIEW verdicts.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-graphite-950 border border-graphite-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-copper-500/10 text-copper-400 flex items-center justify-center font-mono font-bold text-xs">
                    04
                  </span>
                  <span className="text-[10px] font-mono text-graphite-500">2.0ms</span>
                </div>
                <h3 className="font-bold text-white text-sm">AI Forensic Synthesis</h3>
                <p className="text-xs text-graphite-400 leading-relaxed">
                  Cryptographic trace generation, SHAP causal attributions, and automated FinCEN SAR compliance drafting.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ENTERPRISE PILLARS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans">
              Comprehensive Risk Platform Ecosystem
            </h2>
            <p className="text-xs sm:text-sm text-graphite-400">
              Purpose-built tools for fraud analysts, machine learning engineers, and compliance executives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="bg-graphite-900 border border-graphite-800 hover:border-copper-500/40 rounded-2xl p-6 shadow-xl space-y-4 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-copper-500/10 border border-copper-500/30 flex items-center justify-center text-copper-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Enterprise AI Copilot & Forensics</h3>
                <p className="text-xs text-graphite-400 leading-relaxed">
                  Conversational assistant grounded directly in your database. Translates natural language inquiries into SQL, analyzes root causes, and discovers emerging attack clusters.
                </p>
              </div>
              <Link
                href="/ai"
                className="text-xs font-semibold text-copper-400 hover:text-copper-300 flex items-center space-x-1 pt-2"
              >
                <span>Open AI Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Pillar 2 */}
            <div className="bg-graphite-900 border border-graphite-800 hover:border-copper-500/40 rounded-2xl p-6 shadow-xl space-y-4 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-copper-500/10 border border-copper-500/30 flex items-center justify-center text-copper-400">
                  <Network className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Topological Graph Intelligence</h3>
                <p className="text-xs text-graphite-400 leading-relaxed">
                  Interactive multi-hop entity graph visualizer exposing card-testing syndicates, shared device fingerprints, synthetic identity rings, and mule networks.
                </p>
              </div>
              <Link
                href="/graph"
                className="text-xs font-semibold text-copper-400 hover:text-copper-300 flex items-center space-x-1 pt-2"
              >
                <span>Inspect Graph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Pillar 3 */}
            <div className="bg-graphite-900 border border-graphite-800 hover:border-copper-500/40 rounded-2xl p-6 shadow-xl space-y-4 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-copper-500/10 border border-copper-500/30 flex items-center justify-center text-copper-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Policy Rule Studio & Simulator</h3>
                <p className="text-xs text-graphite-400 leading-relaxed">
                  Safe AST rule authoring with instant backtesting across millions of historical transactions. Preview precision, recall, and false positive impacts prior to deployment.
                </p>
              </div>
              <Link
                href="/rules"
                className="text-xs font-semibold text-copper-400 hover:text-copper-300 flex items-center space-x-1 pt-2"
              >
                <span>Rule Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* COMPLIANCE & SECURITY SEALS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-graphite-800/80 pt-12">
          <div className="text-center space-y-6">
            <span className="text-[10px] font-mono text-graphite-500 uppercase tracking-widest block">
              Certified for Global Enterprise & Tier-1 Financial Institutions
            </span>

            <div className="flex flex-wrap items-center justify-center gap-6 text-graphite-400 text-xs font-mono">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-graphite-900 border border-graphite-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>SOC 2 Type II</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-graphite-900 border border-graphite-800">
                <Lock className="w-4 h-4 text-copper-400" />
                <span>PCI-DSS Level 1</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-graphite-900 border border-graphite-800">
                <FileCheck className="w-4 h-4 text-sky-400" />
                <span>ISO/IEC 27001</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-graphite-900 border border-graphite-800">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>FinCEN AML/BSA Compliant</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-graphite-900 border border-graphite-800">
                <Key className="w-4 h-4 text-purple-400" />
                <span>Zero-PII Tokenization</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-graphite-800 bg-graphite-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-graphite-500 font-sans">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-copper-500 flex items-center justify-center text-graphite-950 font-bold text-[10px]">
              R
            </div>
            <span className="text-graphite-300 font-semibold">RiskShield AI Enterprise</span>
            <span>&bull;</span>
            <span className="font-mono text-[10px]">v2.4.0-production</span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-graphite-400">
            <Link href="/operations" className="hover:text-white transition-colors">
              Operations
            </Link>
            <Link href="/ai" className="hover:text-white transition-colors">
              AI Hub
            </Link>
            <Link href="/ingestion" className="hover:text-white transition-colors">
              Ingestion
            </Link>
            <Link href="/settings" className="hover:text-white transition-colors">
              System Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
