"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User as UserIcon,
  Shield,
  Layers,
  Activity,
  ArrowRight,
  RefreshCw,
  Cpu,
  Search,
  Sliders,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useAICopilot, CopilotResponse } from "@/hooks/useAI";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
  evidence?: Record<string, any>;
  recommendedActions?: Array<{
    label: string;
    action: string;
    target: string;
  }>;
}

const defaultPrompts = [
  "Analyze TXN-ML-PRED-991",
  "Suggest a rule for cross-border velocity bursts",
  "What is the current model drift and PSI status?",
  "Discover recent fraud patterns and clusters",
  "How to simulate a card-testing botnet attack?",
];

export default function AICopilotDrawer() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      sender: "copilot",
      text: "Hello, I am **RiskShield AI Copilot**. I have live access to your transactions, policy rules, model ensemble telemetry, and fraud clusters. How can I assist your investigation today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      recommendedActions: [
        { label: "Inspect Fraud Patterns", action: "NAVIGATE", target: "/ai?tab=fraud-patterns" },
        { label: "Open Root Cause Analyzer", action: "NAVIGATE", target: "/ai?tab=rca" },
      ],
    },
  ]);

  const copilotMutation = useAICopilot();
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || inputQuery).trim();
    if (!q || copilotMutation.isPending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery("");

    copilotMutation.mutate(
      { query: q },
      {
        onSuccess: (data: CopilotResponse) => {
          const copilotMsg: ChatMessage = {
            id: `copilot-${Date.now()}`,
            sender: "copilot",
            text: data.answer,
            evidence: data.evidence,
            recommendedActions: data.recommended_actions,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, copilotMsg]);
        },
        onError: () => {
          const errorMsg: ChatMessage = {
            id: `copilot-${Date.now()}`,
            sender: "copilot",
            text: "Encountered a temporary communication issue with the risk intelligence backend. Please try again.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, errorMsg]);
        },
      }
    );
  };

  const handleActionClick = (action: string, target: string) => {
    if (action === "NAVIGATE" || action === "OPEN_RULE_CREATOR") {
      setIsOpen(false);
      router.push(target);
    } else if (action === "OPEN_RCA") {
      setIsOpen(false);
      router.push(`/ai?tab=rca&txn=${target}`);
    } else if (action === "SIMULATE") {
      setIsOpen(false);
      router.push(`/ai?tab=simulation&txn=${target}`);
    } else if (action === "KNN_SEARCH") {
      setIsOpen(false);
      router.push(`/ai?tab=rca&txn=${target}`);
    } else if (action === "BACKTEST" || action === "RETRAIN") {
      handleSend(`Execute ${action} for target ${target}`);
    }
  };

  return (
    <>
      {/* Floating Summon Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex items-center space-x-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-400 hover:to-copper-500 text-graphite-950 font-bold text-xs shadow-2xl shadow-copper-500/30 transition-all duration-300 transform hover:scale-105 select-none",
          isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
        title="Open AI Copilot (Cmd+J)"
      >
        <Sparkles className="w-4 h-4 animate-pulse" />
        <span className="font-sans">AI Copilot</span>
        <kbd className="px-1.5 py-0.5 rounded bg-graphite-950/20 text-[10px] font-mono font-bold">
          ⌘J
        </kbd>
      </button>

      {/* Slide-over Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full justify-end">
            <div className="w-full sm:max-w-lg bg-graphite-900 border-l border-graphite-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 min-w-0">
              {/* Drawer Header */}
              <div className="p-4 border-b border-graphite-800 flex items-center justify-between bg-graphite-950/70">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-copper-500/10 border border-copper-500/30 flex items-center justify-center text-copper-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans flex items-center space-x-2">
                      <span>Enterprise AI Copilot</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        LIVE
                      </span>
                    </h3>
                    <p className="text-[10px] font-mono text-graphite-400">
                      Grounded Multi-Model Forensic Intelligence
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() =>
                      setMessages([
                        {
                          id: "welcome-reset",
                          sender: "copilot",
                          text: "Session cleared. What would you like to investigate next?",
                          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        },
                      ])
                    }
                    className="p-1.5 rounded-lg text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
                    title="Clear Conversation"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
                    title="Close Drawer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Message History */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {messages.map((msg) => {
                  const isCopilot = msg.sender === "copilot";
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col space-y-2 max-w-[92%]",
                        isCopilot ? "self-start items-start" : "self-end items-end ml-auto"
                      )}
                    >
                      <div className="flex items-center space-x-1.5 text-[10px] font-mono text-graphite-500 px-1">
                        {isCopilot ? (
                          <>
                            <Bot className="w-3 h-3 text-copper-400" />
                            <span>RiskShield AI</span>
                          </>
                        ) : (
                          <>
                            <UserIcon className="w-3 h-3 text-graphite-400" />
                            <span>Lead Analyst</span>
                          </>
                        )}
                        <span>&bull;</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={cn(
                          "rounded-xl p-3.5 text-xs leading-relaxed font-sans shadow-sm",
                          isCopilot
                            ? "bg-graphite-950 border border-graphite-800 text-graphite-200"
                            : "bg-copper-500 text-graphite-950 font-medium"
                        )}
                      >
                        <div className="whitespace-pre-wrap">{msg.text}</div>

                        {/* Evidence Card if provided */}
                        {msg.evidence && Object.keys(msg.evidence).length > 0 && (
                          <div className="mt-3 p-2.5 rounded-lg bg-graphite-900/90 border border-graphite-800 font-mono text-[11px] space-y-1.5">
                            <div className="text-[10px] font-bold text-copper-400 uppercase tracking-wider flex items-center space-x-1">
                              <Shield className="w-3 h-3" />
                              <span>Forensic Evidence Grounding</span>
                            </div>
                            <pre className="text-[10px] text-graphite-300 overflow-x-auto max-h-32 p-1.5 rounded bg-black/40">
                              {JSON.stringify(msg.evidence, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Recommended Actions */}
                        {msg.recommendedActions && msg.recommendedActions.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-graphite-800 space-y-1.5">
                            <div className="text-[10px] font-mono font-bold text-graphite-400 uppercase">
                              Executable Next Steps:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.recommendedActions.map((act, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleActionClick(act.action, act.target)}
                                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-copper-500/10 hover:bg-copper-500/20 text-copper-400 border border-copper-500/30 text-[11px] font-semibold transition-colors"
                                >
                                  <span>{act.label}</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {copilotMutation.isPending && (
                  <div className="flex items-center space-x-2 text-xs text-copper-400 font-mono p-2 bg-graphite-950 rounded-lg border border-graphite-800 w-fit animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing multi-model forensic analysis...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="p-3 border-t border-graphite-800 bg-graphite-950/40">
                <div className="text-[10px] font-mono text-graphite-500 uppercase mb-1.5">
                  Suggested Risk Inquiries:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {defaultPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p)}
                      disabled={copilotMutation.isPending}
                      className="px-2 py-1 rounded bg-graphite-800/60 hover:bg-graphite-800 text-[10px] text-graphite-300 hover:text-white border border-graphite-700/50 transition-colors truncate max-w-[220px]"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Query Input Bar */}
              <div className="p-3 border-t border-graphite-800 bg-graphite-950">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Ask Copilot (e.g. 'Analyze TXN-991', 'Suggest rule')..."
                    disabled={copilotMutation.isPending}
                    className="flex-1 bg-graphite-900 border border-graphite-700 focus:border-copper-400 rounded-lg px-3 py-2 text-xs text-white placeholder-graphite-500 focus:outline-none font-sans"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || copilotMutation.isPending}
                    className="p-2 rounded-lg bg-copper-500 hover:bg-copper-400 disabled:opacity-40 text-graphite-950 font-bold transition-all shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
