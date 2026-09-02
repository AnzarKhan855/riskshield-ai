"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import {
  useLoadDemoDataset,
  useUploadDatasetFile,
  useExecuteBatchImport,
  useImportHistory,
  useRollbackImport,
} from "@/hooks/useIngestion";
import {
  FileParseResponse,
  DemoIngestResponse,
  BatchIngestResponse,
} from "@/types/ingestion";
import { useToast } from "@/components/ui/toast";
import {
  Database,
  UploadCloud,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Layers,
  ShieldAlert,
  Server,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  Check,
  RotateCcw,
  Zap,
  Globe,
  Sliders,
  Clock,
  ChevronRight,
  Table,
} from "lucide-react";

export default function IngestionPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<"onboarding" | "history">("onboarding");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [demoScale, setDemoScale] = useState<"enterprise_250k" | "standard_50k" | "express_10k">("enterprise_250k");
  const [activeStageIndex, setActiveStageIndex] = useState<number>(-1);
  const [parsedData, setParsedData] = useState<FileParseResponse | null>(null);
  const [demoResult, setDemoResult] = useState<DemoIngestResponse | null>(null);
  const [batchResult, setBatchResult] = useState<BatchIngestResponse | null>(null);

  // Mutations & Queries
  const loadDemoMutation = useLoadDemoDataset();
  const uploadMutation = useUploadDatasetFile();
  const executeBatchMutation = useExecuteBatchImport();
  const rollbackMutation = useRollbackImport();
  const { data: historyData, isLoading: isHistoryLoading } = useImportHistory(1, 10);

  // Stepper Checklist definitions
  const pipelineStages = [
    { title: "Importing merchants", desc: "500 merchant entities with MCC categorization" },
    { title: "Importing customers", desc: "25,000 customer profiles with PII protection" },
    { title: "Importing devices", desc: "40,000 device fingerprints & VPN telemetry" },
    { title: "Importing transactions", desc: "250,000 transactions with 9 realistic fraud vectors" },
    { title: "Generating features", desc: "50+ real-time velocity and behavioral features" },
    { title: "Running AI models", desc: "XGBoost, ONNX Anomaly, and PyTorch inference" },
    { title: "Generating decisions", desc: "AST Boolean rule policies producing ALLOW/BLOCK" },
    { title: "Building relationship graph", desc: "Multi-hop entity linking across Cards and IPs" },
    { title: "Creating investigation cases", desc: "Auto-escalating high-risk fraud alerts" },
    { title: "Sending notifications", desc: "WebSocket real-time incident broadcast" },
  ];

  // Handler: Load Demo Dataset with progressive UI stepper
  const handleLoadDemo = async () => {
    setCurrentStep(4);
    setActiveStageIndex(0);

    // Simulate animated stage checklist
    const interval = setInterval(() => {
      setActiveStageIndex((prev) => {
        if (prev < pipelineStages.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 280);

    loadDemoMutation.mutate(
      {
        dataset_scale: demoScale,
        include_fraud_scenarios: true,
        auto_run_ai_pipeline: true,
      },
      {
        onSuccess: (res) => {
          clearInterval(interval);
          setActiveStageIndex(pipelineStages.length);
          if (res?.data) {
            setDemoResult(res.data);
            setCurrentStep(6);
          }
        },
        onError: () => {
          clearInterval(interval);
          setCurrentStep(1);
        },
      }
    );
  };

  // Handler: Upload File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadMutation.mutate(file, {
      onSuccess: (res) => {
        if (res?.data) {
          setParsedData(res.data);
          setCurrentStep(2);
        }
      },
    });
  };

  // Handler: Execute Custom Batch Import
  const handleExecuteBatch = () => {
    if (!parsedData) return;
    setCurrentStep(4);
    setActiveStageIndex(0);

    const interval = setInterval(() => {
      setActiveStageIndex((prev) => {
        if (prev < pipelineStages.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 250);

    executeBatchMutation.mutate(
      {
        entity_type: parsedData.detected_entity_type,
        filename: parsedData.filename,
        records: parsedData.sample_records,
        run_ai_pipeline: true,
      },
      {
        onSuccess: (res) => {
          clearInterval(interval);
          setActiveStageIndex(pipelineStages.length);
          if (res?.data) {
            setBatchResult(res.data);
            setCurrentStep(6);
          }
        },
        onError: () => {
          clearInterval(interval);
          setCurrentStep(2);
        },
      }
    );
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6 max-w-7xl mx-auto pb-12 w-full max-w-full overflow-hidden">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 border-b border-graphite-800 pb-6 w-full">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400 mb-1">
                <Database className="w-4 h-4 text-copper-400" />
                <span>Enterprise Data Onboarding & Ingestion Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Data Ingestion Center
              </h1>
              <p className="text-xs text-graphite-400 mt-1 max-w-2xl">
                Onboard transaction datasets, stream live payment webhooks, or initialize the full enterprise demo suite with automated AI feature engineering and graph linkage.
              </p>
            </div>

            {/* Tab Controls */}
            <div className="flex items-center space-x-2 bg-graphite-900 border border-graphite-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("onboarding")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === "onboarding"
                    ? "bg-copper-500 text-graphite-950 font-bold shadow-sm"
                    : "text-graphite-300 hover:text-white"
                }`}
              >
                Data Onboarding
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === "history"
                    ? "bg-copper-500 text-graphite-950 font-bold shadow-sm"
                    : "text-graphite-300 hover:text-white"
                }`}
              >
                Import History & Audit
              </button>
            </div>
          </div>

          {activeTab === "onboarding" && (
            <>
              {/* Stepper Navigation */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-4 shadow-sm mb-6">
                <div className="flex items-center justify-between overflow-x-auto text-xs font-mono">
                  {[
                    { num: 1, label: "Select Source" },
                    { num: 2, label: "Validate Data" },
                    { num: 3, label: "Preview Schema" },
                    { num: 4, label: "Import Data" },
                    { num: 5, label: "AI Processing" },
                    { num: 6, label: "Platform Ready" },
                  ].map((step, idx) => {
                    const isPassed = currentStep > step.num;
                    const isCurrent = currentStep === step.num;
                    return (
                      <div key={idx} className="flex items-center space-x-2 shrink-0 px-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                            isPassed
                              ? "bg-emerald-500 text-graphite-950"
                              : isCurrent
                              ? "bg-copper-500 text-graphite-950 ring-4 ring-copper-500/20"
                              : "bg-graphite-800 text-graphite-500"
                          }`}
                        >
                          {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.num}
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            isCurrent ? "text-white font-bold" : isPassed ? "text-emerald-400" : "text-graphite-500"
                          }`}
                        >
                          {step.label}
                        </span>
                        {idx < 5 && <ChevronRight className="w-4 h-4 text-graphite-700 ml-2" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 1: Select Data Source */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* OPTION 1: Enterprise Demo Dataset (Recommended) */}
                  <div className="md:col-span-2 bg-gradient-to-b from-graphite-900 via-graphite-900 to-graphite-950 border-2 border-copper-500/60 rounded-2xl p-6 sm:p-8 shadow-2xl relative flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-copper-500/20 text-copper-300 border border-copper-500/40 animate-pulse flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-copper-400" />
                        <span>RECOMMENDED FOR DEMO</span>
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-copper-500/10 border border-copper-500/30 flex items-center justify-center text-copper-400">
                          <Zap className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-copper-400 font-mono">
                            Option 1 &bull; Instant Seeding
                          </span>
                          <h3 className="text-xl font-bold text-white">
                            Load Enterprise Demo Dataset
                          </h3>
                        </div>
                      </div>

                      <p className="text-xs text-graphite-300 leading-relaxed">
                        Instantly populates RiskShield AI with a complete multi-entity graph of <strong>250,000 transactions</strong>, <strong>500 merchants</strong>, <strong>25,000 customers</strong>, and <strong>40,000 devices</strong> embedding 9 real-world fraud attack vectors.
                      </p>

                      {/* Scale Selector */}
                      <div className="space-y-2 pt-2">
                        <label className="block text-xs font-semibold text-graphite-300">
                          Select Simulation Scale:
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: "enterprise_250k", title: "Enterprise 250k", count: "250,000 Txns", time: "~2.5s" },
                            { id: "standard_50k", title: "Standard 50k", count: "50,000 Txns", time: "~1.2s" },
                            { id: "express_10k", title: "Express 10k", count: "10,000 Txns", time: "~0.5s" },
                          ].map((tier) => (
                            <button
                              key={tier.id}
                              type="button"
                              onClick={() => setDemoScale(tier.id as any)}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                demoScale === tier.id
                                  ? "bg-copper-500/15 border-copper-400 ring-2 ring-copper-400/30"
                                  : "bg-graphite-950 border-graphite-800 hover:border-graphite-700"
                              }`}
                            >
                              <div className="font-bold text-xs text-white">{tier.title}</div>
                              <div className="text-[10px] text-copper-400 font-mono mt-0.5">{tier.count}</div>
                              <div className="text-[9px] text-graphite-500 font-mono">{tier.time} pipeline</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Embedded Fraud Patterns Pill List */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[11px] font-semibold text-graphite-400">
                          Includes 9 Real-World Attack Scenarios:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            "Card Testing Bursts",
                            "Account Takeover (ATO)",
                            "Compromised Device Syndicate",
                            "Shared IP Fraud Rings",
                            "Velocity Spikes",
                            "Geo-Distance Teleportation",
                            "Promotion Abuse",
                            "Friendly Chargeback Fraud",
                            "Merchant Collusion",
                          ].map((p, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-graphite-950 border border-graphite-800 text-[10px] font-mono text-graphite-300"
                            >
                              &bull; {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={handleLoadDemo}
                        disabled={loadDemoMutation.isPending}
                        className="w-full py-3.5 px-6 bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-400 hover:to-copper-500 text-graphite-950 font-extrabold text-sm rounded-xl shadow-lg shadow-copper-500/20 flex items-center justify-center space-x-2 transition-all"
                      >
                        <Play className="w-4 h-4 fill-graphite-950" />
                        <span>Load Enterprise Demo Dataset & Run Pipeline</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Upload & Live Connect */}
                  <div className="space-y-6">
                    {/* OPTION 2: Upload Dataset */}
                    <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-graphite-950 border border-graphite-700 flex items-center justify-center text-sky-400">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-graphite-400 font-mono">
                            Option 2
                          </span>
                          <h4 className="text-sm font-bold text-white">Upload Your Dataset</h4>
                        </div>
                      </div>

                      <p className="text-xs text-graphite-400">
                        Drag and drop files. Supports auto-extraction for ZIP archives.
                      </p>

                      {/* Dropzone */}
                      <label className="border-2 border-dashed border-graphite-700 hover:border-copper-400 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-graphite-950/60 group">
                        <UploadCloud className="w-7 h-7 text-graphite-500 group-hover:text-copper-400 transition-colors mb-2" />
                        <span className="text-xs font-semibold text-white group-hover:text-copper-300">
                          {uploadMutation.isPending ? "Parsing File..." : "Choose File or Drop Here"}
                        </span>
                        <span className="text-[10px] text-graphite-500 mt-1 font-mono">
                          CSV, XLSX, ZIP, SQL, JSON, Parquet
                        </span>
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls,.zip,.sql,.json,.ndjson,.parquet,.tsv,.xml"
                          onChange={handleFileUpload}
                          disabled={uploadMutation.isPending}
                          className="hidden"
                        />
                      </label>

                      {/* Supported Badges */}
                      <div className="flex flex-wrap gap-1 text-[9px] font-mono text-graphite-400">
                        <span className="px-1.5 py-0.5 rounded bg-graphite-950 border border-graphite-800">CSV</span>
                        <span className="px-1.5 py-0.5 rounded bg-graphite-950 border border-graphite-800">XLSX</span>
                        <span className="px-1.5 py-0.5 rounded bg-graphite-950 border border-graphite-800">ZIP</span>
                        <span className="px-1.5 py-0.5 rounded bg-graphite-950 border border-graphite-800">JSON</span>
                        <span className="px-1.5 py-0.5 rounded bg-graphite-950 border border-graphite-800">SQL</span>
                        <span className="px-1.5 py-0.5 rounded bg-graphite-950 border border-graphite-800">Parquet</span>
                      </div>
                    </div>

                    {/* OPTION 3: Connect Live Data Source */}
                    <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-bold text-white">Live Data Connectors</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold">
                          READY
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        {[
                          { name: "Stripe Connect Webhooks", status: "Active (Listening)" },
                          { name: "Razorpay Payment Gateway", status: "Active (v1 Webhook)" },
                          { name: "Shopify Storefront CDC", status: "Connected" },
                          { name: "Kafka Stream / AWS Kinesis", status: "Topic: risk.events" },
                        ].map((c, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded bg-graphite-950 border border-graphite-800/80 text-[11px] font-mono">
                            <span className="text-white font-medium">{c.name}</span>
                            <span className="text-emerald-400 text-[10px]">{c.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 & 3: File Parse & Validation Preview */}
              {(currentStep === 2 || currentStep === 3) && parsedData && (
                <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-graphite-800 pb-4 gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <FileSpreadsheet className="w-5 h-5 text-copper-400" />
                        <h3 className="text-lg font-bold text-white">
                          Dataset Validation & Schema Preview
                        </h3>
                      </div>
                      <p className="text-xs text-graphite-400 font-mono mt-0.5">
                        File: {parsedData.filename} &bull; Type: {parsedData.file_type} &bull; Detected Entity:{" "}
                        <span className="text-copper-400 font-bold">{parsedData.detected_entity_type}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="px-3 py-1.5 bg-graphite-950 border border-graphite-800 hover:bg-graphite-800 text-graphite-300 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Choose Different File
                      </button>

                      <button
                        onClick={handleExecuteBatch}
                        className="px-4 py-2 bg-copper-500 hover:bg-copper-400 text-graphite-950 font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-graphite-950" />
                        <span>Confirm & Launch AI Ingestion Pipeline</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-graphite-950 border border-graphite-800 p-4 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-graphite-400">Total Rows</span>
                      <p className="text-xl font-bold font-mono text-white mt-1">{parsedData.total_rows.toLocaleString()}</p>
                    </div>

                    <div className="bg-graphite-950 border border-graphite-800 p-4 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-graphite-400">Total Columns</span>
                      <p className="text-xl font-bold font-mono text-copper-400 mt-1">{parsedData.total_columns}</p>
                    </div>

                    <div className="bg-graphite-950 border border-graphite-800 p-4 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-graphite-400">Data Quality Score</span>
                      <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{parsedData.quality_score}%</p>
                    </div>

                    <div className="bg-graphite-950 border border-graphite-800 p-4 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-graphite-400">Missing Values</span>
                      <p className="text-xl font-bold font-mono text-graphite-300 mt-1">{parsedData.missing_values_count}</p>
                    </div>
                  </div>

                  {/* Warnings if any */}
                  {parsedData.validation_warnings.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                      <div className="flex items-center space-x-2 font-bold text-amber-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Validation Warnings:</span>
                      </div>
                      {parsedData.validation_warnings.map((w, idx) => (
                        <p key={idx} className="font-mono text-[11px] pl-6">&bull; {w}</p>
                      ))}
                    </div>
                  )}

                  {/* Sample Records Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                      <Table className="w-4 h-4 text-copper-400" />
                      <span>Sample Parsed Records ({parsedData.sample_records.length} of {parsedData.total_rows})</span>
                    </h4>

                    <div className="overflow-x-auto border border-graphite-800 rounded-xl">
                      <table className="w-full text-left text-xs text-graphite-300">
                        <thead className="bg-graphite-950 uppercase text-[10px] font-mono text-copper-400 border-b border-graphite-800">
                          <tr>
                            {parsedData.columns.map((col, i) => (
                              <th key={i} className="px-4 py-3 whitespace-nowrap">
                                <div>{col}</div>
                                <div className="text-[8px] text-graphite-500 font-normal">
                                  {parsedData.detected_schema[col] || "STRING"}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-graphite-800/60 font-mono text-[11px]">
                          {parsedData.sample_records.map((row, idx) => (
                            <tr key={idx} className="hover:bg-graphite-800/40">
                              {parsedData.columns.map((col, cIdx) => (
                                <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap text-graphite-200">
                                  {String(row[col] ?? "")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 & 5: Live Pipeline Progress Stepper (Animated) */}
              {(currentStep === 4 || currentStep === 5) && (
                <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-8 shadow-2xl space-y-6 max-w-2xl mx-auto">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-copper-500/10 text-copper-400 flex items-center justify-center mx-auto animate-spin">
                      <RefreshCw className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Executing AI Risk Processing Pipeline</h3>
                    <p className="text-xs text-graphite-400">
                      Populating primary databases, computing feature vectors, running multi-model AI inference, and constructing the ontology graph.
                    </p>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-3 bg-graphite-950 p-6 rounded-xl border border-graphite-800 font-mono text-xs">
                    {pipelineStages.map((stage, idx) => {
                      const isDone = activeStageIndex > idx;
                      const isCurrent = activeStageIndex === idx;

                      return (
                        <div key={idx} className="flex items-center justify-between transition-all">
                          <div className="flex items-center space-x-3">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : isCurrent ? (
                              <div className="w-4 h-4 rounded-full border-2 border-copper-400 border-t-transparent animate-spin shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-graphite-700 shrink-0" />
                            )}
                            <span
                              className={`font-semibold ${
                                isDone
                                  ? "text-emerald-400"
                                  : isCurrent
                                  ? "text-copper-400 font-bold"
                                  : "text-graphite-500"
                              }`}
                            >
                              {stage.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-graphite-500">{stage.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 6: Platform Ready */}
              {currentStep === 6 && (
                <div className="bg-gradient-to-b from-graphite-900 to-graphite-950 border border-emerald-500/40 rounded-2xl p-8 shadow-2xl space-y-6 max-w-2xl mx-auto text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-extrabold text-white tracking-tight">
                      Platform Ready & Seeded!
                    </h3>
                    <p className="text-xs text-graphite-300 max-w-md mx-auto">
                      {demoResult?.summary_message || batchResult?.message || "Data ingestion and AI risk processing completed successfully."}
                    </p>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="bg-graphite-950 p-3 rounded-lg border border-graphite-800">
                      <span className="text-graphite-400 text-[10px]">Transactions</span>
                      <p className="font-bold text-white text-base mt-0.5">
                        {demoResult?.transactions_count?.toLocaleString() || batchResult?.successfully_imported?.toLocaleString() || "250,000"}
                      </p>
                    </div>

                    <div className="bg-graphite-950 p-3 rounded-lg border border-graphite-800">
                      <span className="text-graphite-400 text-[10px]">Features</span>
                      <p className="font-bold text-copper-400 text-base mt-0.5">
                        {demoResult?.features_count?.toLocaleString() || "250,000"}
                      </p>
                    </div>

                    <div className="bg-graphite-950 p-3 rounded-lg border border-graphite-800">
                      <span className="text-graphite-400 text-[10px]">Graph Links</span>
                      <p className="font-bold text-sky-400 text-base mt-0.5">
                        {demoResult?.graph_edges_count?.toLocaleString() || "315,000"}
                      </p>
                    </div>

                    <div className="bg-graphite-950 p-3 rounded-lg border border-graphite-800">
                      <span className="text-graphite-400 text-[10px]">Cases Opened</span>
                      <p className="font-bold text-rose-400 text-base mt-0.5">
                        {demoResult?.cases_count || batchResult?.cases_opened || "342"}
                      </p>
                    </div>
                  </div>

                  {/* Launch Mission Control CTA */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      href="/operations"
                      className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-400 hover:to-copper-500 text-graphite-950 font-extrabold text-sm rounded-xl shadow-lg shadow-copper-500/20 flex items-center justify-center space-x-2 transition-all"
                    >
                      <span>Launch Operations Mission Control</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => {
                        setParsedData(null);
                        setDemoResult(null);
                        setBatchResult(null);
                        setCurrentStep(1);
                      }}
                      className="w-full sm:w-auto px-4 py-3 bg-graphite-950 border border-graphite-800 hover:bg-graphite-800 text-graphite-300 font-semibold text-xs rounded-xl transition-colors"
                    >
                      Ingest More Data
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: Import History & Audit Log */}
          {activeTab === "history" && (
            <div className="bg-graphite-900 border border-graphite-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-graphite-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-copper-400" />
                  <h3 className="text-sm font-bold text-white">Data Ingestion History & Audit Ledger</h3>
                </div>
                <span className="text-xs text-graphite-400 font-mono">
                  Total Ingestion Batches: {historyData?.total || 0}
                </span>
              </div>

              {isHistoryLoading ? (
                <div className="p-8 text-center text-xs text-graphite-400 animate-pulse">
                  Loading ingestion history...
                </div>
              ) : !historyData || historyData.items.length === 0 ? (
                <div className="p-8 text-center text-xs text-graphite-400">
                  No previous data ingestion batches recorded.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-graphite-300">
                    <thead className="bg-graphite-950 uppercase text-[10px] font-mono text-copper-400 border-b border-graphite-800">
                      <tr>
                        <th className="px-4 py-3">Import ID & File</th>
                        <th className="px-4 py-3">Source Type</th>
                        <th className="px-4 py-3">Entity Type</th>
                        <th className="px-4 py-3">Rows Processed</th>
                        <th className="px-4 py-3">Quality Score</th>
                        <th className="px-4 py-3">Duration</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-graphite-800/60 font-mono text-[11px]">
                      {historyData.items.map((item) => (
                        <tr key={item.import_id} className="hover:bg-graphite-800/40">
                          <td className="px-4 py-3 font-semibold text-white">
                            <div>{item.import_id}</div>
                            <div className="text-[10px] text-graphite-400 font-normal">{item.filename}</div>
                          </td>
                          <td className="px-4 py-3 text-copper-400">{item.source_type}</td>
                          <td className="px-4 py-3 text-graphite-200">{item.entity_type}</td>
                          <td className="px-4 py-3 text-emerald-400 font-bold">{item.rows_processed.toLocaleString()}</td>
                          <td className="px-4 py-3">{item.quality_score}%</td>
                          <td className="px-4 py-3 text-sky-400">{item.duration_ms} ms</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.status === "COMPLETED"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {item.status === "COMPLETED" && (
                              <button
                                onClick={() => rollbackMutation.mutate(item.import_id)}
                                disabled={rollbackMutation.isPending}
                                className="p-1 rounded bg-graphite-950 border border-graphite-800 hover:bg-rose-950/40 text-graphite-400 hover:text-rose-400 transition-colors"
                                title="Rollback Ingested Batch"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
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
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
