"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Activity,
  Network,
  Bell,
  ShieldCheck,
  Sliders,
  FileCheck,
  ShieldAlert,
  GitPullRequest,
  Cpu,
  Zap,
  Layers,
  Database,
  Users,
  Smartphone,
  X,
  Command,
  Sparkles,
} from "lucide-react";


interface CommandItem {
  name: string;
  category: string;
  href: string;
  icon: React.ElementType;
}

const commands: CommandItem[] = [
  { name: "Data Ingestion & Onboarding Center", category: "Command Center", href: "/ingestion", icon: Database },
  { name: "Risk Operations Center", category: "Command Center", href: "/operations", icon: Activity },
  { name: "Relationship Graph Intelligence", category: "Command Center", href: "/graph", icon: Network },
  { name: "Notification Center & Event Feed", category: "Command Center", href: "/notifications", icon: Bell },
  { name: "Decision Intelligence Studio", category: "Risk & Decisions", href: "/decisions", icon: ShieldCheck },
  { name: "Rule Studio & Policy Rules", category: "Risk & Decisions", href: "/rules", icon: Sliders },
  { name: "AI Explainability & Audit Center", category: "Risk & Decisions", href: "/explanations", icon: FileCheck },
  { name: "Investigation Cases", category: "Risk & Decisions", href: "/cases", icon: ShieldAlert },
  { name: "Enterprise AI Hub & Copilot", category: "AI & Intelligence", href: "/ai", icon: Sparkles },
  { name: "AI Natural Language Search Studio", category: "AI & Intelligence", href: "/ai?tab=nl-search", icon: Search },
  { name: "Root Cause Forensics (RCA)", category: "AI & Intelligence", href: "/ai?tab=rca", icon: Activity },
  { name: "Fraud Pattern Discovery & Defense", category: "AI & Intelligence", href: "/ai?tab=fraud-patterns", icon: ShieldAlert },
  { name: "Risk Simulation & Scenario Sandbox", category: "AI & Intelligence", href: "/ai?tab=simulation", icon: Sliders },
  { name: "AI Orchestration Platform", category: "AI & Intelligence", href: "/orchestrator", icon: GitPullRequest },
  { name: "Model Registry & Drift Monitoring", category: "AI & Intelligence", href: "/models", icon: Cpu },
  { name: "ML Predictions & Inference", category: "AI & Intelligence", href: "/predictions", icon: Zap },
  { name: "Feature Store Registry", category: "AI & Intelligence", href: "/features", icon: Layers },

  { name: "Transaction Platform", category: "Entities", href: "/transactions", icon: Database },
  { name: "Merchant Management", category: "Entities", href: "/merchants", icon: Layers },
  { name: "Customer Intelligence", category: "Entities", href: "/customers", icon: Users },
  { name: "Device Intelligence", category: "Entities", href: "/devices", icon: Smartphone },
  { name: "Platform Settings & API Keys", category: "System", href: "/settings", icon: Sliders },
  { name: "Analyst Profile & Security", category: "System", href: "/profile", icon: Users },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const filteredCommands = commands.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = React.useCallback(
    (href: string) => {
      setIsOpen(false);
      setQuery("");
      setSelectedIndex(0);
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      } else if (isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (filteredCommands.length > 0 ? (prev + 1) % filteredCommands.length : 0));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (filteredCommands.length > 0 ? (prev - 1 + filteredCommands.length) % filteredCommands.length : 0));
        } else if (e.key === "Enter" && filteredCommands.length > 0) {
          e.preventDefault();
          const target = filteredCommands[selectedIndex];
          if (target) {
            handleSelect(target.href);
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, handleSelect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="relative border-b border-graphite-800 p-4 flex items-center">
          <Search className="w-4 h-4 text-copper-400 mr-3" />
          <input
            type="text"
            placeholder="Type a command or search platform workspace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-white text-xs placeholder-graphite-500 focus:outline-none font-sans"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="text-graphite-400 hover:text-white p-1 rounded-lg ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Items List */}
        <div className="max-h-80 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-graphite-400">
              No matching commands or routes found.
            </div>
          ) : (
            filteredCommands.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.href)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs transition-colors group ${
                    isSelected
                      ? "bg-graphite-800 text-white font-semibold"
                      : "text-graphite-300 hover:bg-graphite-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 transition-colors ${isSelected ? "text-copper-400" : "text-graphite-400 group-hover:text-copper-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono ${isSelected ? "text-graphite-300" : "text-graphite-500 group-hover:text-graphite-300"}`}>
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="bg-graphite-950 border-t border-graphite-800 px-4 py-2 flex items-center justify-between text-[10px] text-graphite-400 font-mono">
          <div className="flex items-center space-x-2">
            <span>Navigation:</span>
            <span className="bg-graphite-800 px-1.5 py-0.5 rounded text-white font-bold">↑↓ Select</span>
            <span className="bg-graphite-800 px-1.5 py-0.5 rounded text-white font-bold">↵ Open</span>
          </div>
          <div className="flex items-center space-x-1">
            <Command className="w-3 h-3 text-copper-400" />
            <span>K to toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
