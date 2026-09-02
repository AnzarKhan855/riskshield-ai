"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Layers,
  Cpu,
  ShieldAlert,
  GitPullRequest,
  Search,
  Bell,
  Sliders,
  Database,
  Users,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Network,
  FileCheck,
  Sparkles,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface NavGroup {
  title: string;
  items: {
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: "Command Center",
    items: [
      { name: "Data Ingestion", href: "/ingestion", icon: Database, badge: "START" },
      { name: "Risk Operations", href: "/operations", icon: Activity, badge: "LIVE" },
      { name: "Graph Intelligence", href: "/graph", icon: Network },
      { name: "Notification Center", href: "/notifications", icon: Bell },
    ],
  },
  {
    title: "Risk & Decisions",
    items: [
      { name: "Decision Studio", href: "/decisions", icon: ShieldCheck },
      { name: "Policy Rules", href: "/rules", icon: Sliders },
      { name: "AI Explainability", href: "/explanations", icon: FileCheck },
      { name: "Cases & Audits", href: "/cases", icon: ShieldAlert },
    ],
  },
  {
    title: "AI & Intelligence",
    items: [
      { name: "Enterprise AI Hub", href: "/ai", icon: Sparkles, badge: "AI" },
      { name: "AI Orchestrator", href: "/orchestrator", icon: GitPullRequest },
      { name: "Model Registry", href: "/models", icon: Cpu },
      { name: "ML Predictions", href: "/predictions", icon: Zap },
      { name: "Feature Store", href: "/features", icon: Layers },
    ],
  },
  {
    title: "Entity Platform",
    items: [
      { name: "Transactions", href: "/transactions", icon: Database },
      { name: "Merchants", href: "/merchants", icon: Layers },
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Devices", href: "/devices", icon: Smartphone },
    ],
  },
  {
    title: "System & Admin",
    items: [
      { name: "Platform Settings", href: "/settings", icon: Sliders },
      { name: "Analyst Profile", href: "/profile", icon: Users },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggleMobile = () => setMobileOpen((prev) => !prev);
    const handleCloseMobile = () => setMobileOpen(false);

    window.addEventListener("toggle-mobile-menu", handleToggleMobile);
    window.addEventListener("close-mobile-menu", handleCloseMobile);
    return () => {
      window.removeEventListener("toggle-mobile-menu", handleToggleMobile);
      window.removeEventListener("close-mobile-menu", handleCloseMobile);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navContent = (
    <div className="p-3 space-y-5 overflow-y-auto custom-scrollbar flex-1">
      {navGroups.map((group, idx) => (
        <div key={idx} className="space-y-1">
          {(!collapsed || mobileOpen) && (
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-graphite-400">
              {group.title}
            </h4>
          )}

          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed && !mobileOpen ? item.name : undefined}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors group relative",
                    isActive
                      ? "bg-copper-500/10 text-copper-400 font-bold border border-copper-500/30"
                      : "text-graphite-300 hover:bg-graphite-800 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 flex-shrink-0 transition-colors",
                      isActive ? "text-copper-400" : "text-graphite-400 group-hover:text-white"
                    )}
                  />
                  {(!collapsed || mobileOpen) && <span className="ml-3 truncate">{item.name}</span>}

                  {(!collapsed || mobileOpen) && item.badge && (
                    <span className="ml-auto px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}

                  {collapsed && !mobileOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-graphite-950 text-white text-[10px] font-semibold rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Full-Height Sidebar */}
      <aside
        className={cn(
          "bg-graphite-900 border-r border-graphite-800 transition-all duration-300 hidden lg:flex flex-col justify-between select-none z-40 h-screen flex-shrink-0 overflow-hidden",
          collapsed ? "w-[72px]" : "w-[280px]"
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "h-16 border-b border-graphite-800 flex items-center shrink-0",
            collapsed ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          {collapsed ? (
            <Link href="/operations" className="flex items-center justify-center group" title="RiskShield AI">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-copper-500/20 to-graphite-950 border border-copper-500/40 flex items-center justify-center text-copper-400 font-bold shadow-lg group-hover:border-copper-400 transition-all shrink-0">
                <ShieldCheck className="w-5 h-5 text-copper-400" />
              </div>
            </Link>
          ) : (
            <Link href="/operations" className="flex items-center space-x-3 group min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-copper-500/20 to-graphite-950 border border-copper-500/40 flex items-center justify-center text-copper-400 font-bold shadow-lg group-hover:border-copper-400 transition-all shrink-0">
                <ShieldCheck className="w-5 h-5 text-copper-400 group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold text-white tracking-tight leading-none truncate">
                  RiskShield <span className="text-copper-400">AI</span>
                </span>
                <span className="text-[9px] font-mono text-graphite-400 tracking-wider uppercase font-semibold mt-1 truncate">
                  Enterprise Platform
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Navigation List */}
        {navContent}

        {/* Collapse Toggle Footer */}
        <div className="p-3 border-t border-graphite-800 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl bg-graphite-950 border border-graphite-800 text-graphite-400 hover:text-white hover:border-graphite-700 transition-colors"
            title={collapsed ? "Expand Sidebar (280px)" : "Collapse Sidebar (72px)"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer */}
          <div className="relative w-72 max-w-[80vw] bg-graphite-900 border-r border-graphite-800 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200 h-screen">
            <div className="flex items-center justify-between p-4 border-b border-graphite-800 shrink-0">
              <Link href="/operations" className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-copper-500/20 border border-copper-500/40 flex items-center justify-center text-copper-400 font-bold">
                  <ShieldCheck className="w-4 h-4 text-copper-400" />
                </div>
                <span className="text-sm font-bold text-white font-sans">
                  RiskShield <span className="text-copper-400">AI</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-graphite-400 hover:text-white bg-graphite-950 border border-graphite-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
