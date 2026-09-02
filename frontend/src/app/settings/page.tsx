"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import { useToast } from "@/components/ui/toast";
import {
  Sliders,
  Key,
  Webhook,
  Bell,
  Cpu,
  ShieldCheck,
  Save,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";

export default function SettingsPage() {
  const { showToast } = useToast();

  // Settings State
  const [apiKey, setApiKey] = useState("rs_live_99a81f3d82bc4e77a1198c6340ef2");
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://api.merchant.com/v1/risk-webhook");
  const [blockThreshold, setBlockThreshold] = useState(85);
  const [reviewThreshold, setReviewThreshold] = useState(60);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [wsNotifications, setWsNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    showToast("API Key copied to clipboard!", "info");
  };

  const handleGenerateKey = () => {
    const newKey = "rs_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(newKey);
    showToast("New production API Key generated.", "success");
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast("Enterprise platform settings saved successfully.", "success");
    }, 500);
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6 max-w-5xl w-full max-w-full overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 w-full">
            <div className="min-w-0">
              <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400 mb-1">
                <Sliders className="w-4 h-4 text-copper-400 shrink-0" />
                <span className="truncate">Enterprise Administration</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                Platform Configuration & Settings
              </h1>
              <p className="text-xs text-graphite-400 mt-1">
                Configure risk decision thresholds, API keys, webhook subscribers, and system alert routing.
              </p>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-4 py-2.5 bg-copper-500 hover:bg-copper-400 text-graphite-950 font-bold text-xs rounded-lg transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* API Keys Card */}
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-graphite-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-copper-400" />
                  <h3 className="text-sm font-semibold text-white">Production API Key</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  ACTIVE
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <label className="block text-graphite-300 font-semibold">Live Secret Key</label>
                <div className="flex items-center space-x-2">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    readOnly
                    className="flex-1 px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-copper-400 font-mono text-xs focus:outline-none"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-2 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-400 hover:text-white transition-colors"
                    title={showApiKey ? "Hide Key" : "Show Key"}
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleCopyKey}
                    className="p-2 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-400 hover:text-white transition-colors"
                    title="Copy API Key"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-graphite-400 pt-1">
                  Authenticate REST API requests by passing header <code className="text-copper-400 font-mono">Authorization: Bearer &lt;key&gt;</code>.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleGenerateKey}
                  className="px-3 py-1.5 rounded-lg bg-graphite-950 border border-graphite-700 hover:bg-graphite-800 text-graphite-300 text-xs font-semibold transition-colors flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-copper-400" />
                  <span>Roll New API Key</span>
                </button>
              </div>
            </div>

            {/* Webhook Settings Card */}
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
                <Webhook className="w-4 h-4 text-copper-400" />
                <h3 className="text-sm font-semibold text-white">Event Webhooks</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-graphite-300 font-semibold mb-1.5">Webhook Endpoint URL</label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-graphite-400">
                  Risk decisions (<code className="text-rose-400 font-mono">BLOCK</code>, <code className="text-amber-400 font-mono">REVIEW</code>) and critical case alerts are POSTed automatically in JSON envelope format.
                </p>
              </div>
            </div>

            {/* Decision Threshold Policy */}
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
                <Cpu className="w-4 h-4 text-copper-400" />
                <h3 className="text-sm font-semibold text-white">AI Decision Score Thresholds</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-graphite-300">Automatic BLOCK Cutoff</span>
                    <span className="font-mono text-rose-400 font-bold">&ge; {blockThreshold}/100</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="99"
                    value={blockThreshold}
                    onChange={(e) => setBlockThreshold(Number(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-graphite-300">Manual REVIEW Trigger</span>
                    <span className="font-mono text-amber-400 font-bold">&ge; {reviewThreshold}/100</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    value={reviewThreshold}
                    onChange={(e) => setReviewThreshold(Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Notification & Telemetry Preferences */}
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
                <Bell className="w-4 h-4 text-copper-400" />
                <h3 className="text-sm font-semibold text-white">Notification Preferences</h3>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-graphite-950 border border-graphite-800 cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">WebSocket Real-Time Feed</span>
                    <span className="text-[11px] text-graphite-400">Stream new transactions & decisions directly to UI</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={wsNotifications}
                    onChange={(e) => setWsNotifications(e.target.checked)}
                    className="rounded bg-graphite-900 border-graphite-700 text-copper-500 focus:ring-copper-400"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-graphite-950 border border-graphite-800 cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Critical Email Alerts</span>
                    <span className="text-[11px] text-graphite-400">Send urgent incident alerts to analyst on-call group</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="rounded bg-graphite-900 border-graphite-700 text-copper-500 focus:ring-copper-400"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
