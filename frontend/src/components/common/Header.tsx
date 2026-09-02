"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Search,
  LogOut,
  User as UserIcon,
  Activity,
  Globe,
  Building2,
  ChevronDown,
  Sparkles,
  HelpCircle,
  X,
  Keyboard,
  Menu,
} from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/components/ui/toast";

const institutions = [
  { id: "jpmc", name: "JPMorgan Chase & Co. — Institutional Risk", code: "JPMC-PROD-01" },
  { id: "goldman", name: "Goldman Sachs — Global Transactions", code: "GS-RISK-EAST" },
  { id: "stripe", name: "Stripe Connect — High-Velocity Mesh", code: "STRIPE-CONNECT-04" },
  { id: "razorpay", name: "Razorpay Enterprise — Unified Gateway", code: "RZP-TIER1-PROD" },
];

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { showToast } = useToast();
  const [selectedInst, setSelectedInst] = useState(institutions[0]);
  const [instMenuOpen, setInstMenuOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  const triggerCommandPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    );
  };

  const handleLogout = () => {
    logout();
    showToast("Signed out of RiskShield AI successfully.", "info");
    router.push("/login");
  };

  return (
    <>
      <header className="bg-graphite-900/95 backdrop-blur-md border-b border-graphite-800 sticky top-0 z-30 w-full flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand on mobile & Tenant Switcher on Desktop */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => window.dispatchEvent(new Event("toggle-mobile-menu"))}
              className="lg:hidden p-1.5 rounded-lg bg-graphite-950 border border-graphite-800 text-graphite-300 hover:text-white shrink-0"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-4 h-4 text-copper-400" />
            </button>

            {/* Mobile Brand Logo */}
            <Link href="/operations" className="lg:hidden flex items-center space-x-2.5 group min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-copper-500/20 to-graphite-950 border border-copper-500/40 flex items-center justify-center text-copper-400 font-bold shadow-lg shrink-0">
                <Shield className="w-4 h-4 text-copper-400" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight truncate">
                RiskShield <span className="text-copper-400">AI</span>
              </span>
            </Link>

            {/* Institution Switcher Dropdown (Desktop) */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setInstMenuOpen(!instMenuOpen)}
                className="flex items-center space-x-2 bg-graphite-950 border border-graphite-800 hover:border-graphite-700 px-3 py-1.5 rounded-xl text-xs transition-colors text-left"
              >
                <Building2 className="w-3.5 h-3.5 text-copper-400" />
                <div className="flex flex-col pr-1">
                  <span className="text-[11px] font-semibold text-graphite-200 truncate max-w-[220px]">
                    {selectedInst.name.split("—")[0].trim()}
                  </span>
                  <span className="text-[9px] font-mono text-graphite-400">{selectedInst.code}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-graphite-400" />
              </button>

              {instMenuOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-graphite-900 border border-graphite-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase text-graphite-400 border-b border-graphite-800 mb-1">
                    Select Enterprise Tenant
                  </div>
                  {institutions.map((inst) => (
                    <button
                      key={inst.id}
                      onClick={() => {
                        setSelectedInst(inst);
                        setInstMenuOpen(false);
                        showToast(`Switched tenant to ${inst.name.split("—")[0].trim()}`, "info");
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex flex-col transition-colors ${
                        selectedInst.id === inst.id
                          ? "bg-copper-500/10 text-copper-300 font-semibold border border-copper-500/20"
                          : "text-graphite-300 hover:bg-graphite-800 hover:text-white"
                      }`}
                    >
                      <span className="font-semibold">{inst.name}</span>
                      <span className="text-[10px] font-mono text-graphite-400 mt-0.5">{inst.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Global Search Command Bar */}
          <button
            onClick={triggerCommandPalette}
            className="flex items-center space-x-2 bg-graphite-950 border border-graphite-800 hover:border-copper-400/50 px-2 sm:px-3 py-1.5 rounded-lg text-xs text-graphite-400 transition-all w-auto sm:w-56 md:w-72 lg:w-96 justify-between shadow-inner min-w-0 shrink"
            title="Search entities, rules, models, cases, transactions (Cmd+K)"
          >
            <div className="flex items-center space-x-2 min-w-0">
              <Search className="w-3.5 h-3.5 text-copper-400 shrink-0" />
              <span className="font-sans text-graphite-300 truncate hidden sm:inline">Quick action or search...</span>
              <span className="font-sans text-graphite-300 truncate sm:hidden">Search</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-graphite-800 text-[10px] font-mono text-copper-400 border border-graphite-700 font-bold shadow-sm shrink-0">
              ⌘K
            </kbd>
          </button>

          {/* Telemetry HUD & User Profile */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            {/* Live Health & Telemetry Pill */}
            <div className="hidden xl:flex items-center space-x-3 bg-graphite-950 px-3 py-1.5 rounded-lg border border-graphite-800 font-mono text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-bold text-[11px]">PROD-US-EAST-1</span>
              </div>
              <span className="text-graphite-600">&bull;</span>
              <span className="text-graphite-400 text-[11px]">p99: <strong className="text-sky-400">22ms</strong></span>
              <span className="text-graphite-600">&bull;</span>
              <span className="text-graphite-400 text-[11px]">TPS: <strong className="text-copper-400">14.8k</strong></span>
            </div>

            {/* Keyboard Shortcuts Trigger */}
            <button
              onClick={() => setShortcutsModalOpen(true)}
              className="p-2 rounded-lg bg-graphite-950 border border-graphite-800 hover:bg-graphite-800 text-graphite-400 hover:text-white transition-colors"
              title="Keyboard Shortcuts Guide (?)"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            <NotificationBell />

            {/* User Profile & Logout Action */}
            {user && (
              <div className="flex items-center space-x-2 pl-2 border-l border-graphite-800">
                <Link
                  href="/profile"
                  className="hidden md:flex flex-col text-right hover:opacity-80 transition-opacity"
                  title="View Profile & Credentials"
                >
                  <span className="text-xs font-semibold text-white">
                    {user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user.email.split("@")[0]}
                  </span>
                  <span className="text-[10px] font-mono text-copper-400 uppercase font-bold tracking-wide">
                    {user.role}
                  </span>
                </Link>

                <Link
                  href="/profile"
                  className="w-8 h-8 rounded-lg bg-graphite-950 border border-graphite-700 text-copper-400 flex items-center justify-center font-bold text-xs hover:border-copper-400 transition-colors shadow-sm"
                  title="View Profile & Credentials"
                >
                  {user.first_name ? user.first_name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-graphite-950 border border-graphite-800 hover:bg-rose-950/40 text-graphite-400 hover:text-rose-400 transition-colors shadow-sm"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      {shortcutsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-graphite-900 border border-graphite-700 rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-graphite-800 pb-3">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <Keyboard className="w-4 h-4 text-copper-400" />
                <span>Enterprise Command & Navigation Shortcuts</span>
              </div>
              <button
                onClick={() => setShortcutsModalOpen(false)}
                className="p-1 rounded-lg text-graphite-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-graphite-950 p-3 rounded-xl border border-graphite-800 flex justify-between items-center">
                <span className="text-graphite-300">Command Palette</span>
                <kbd className="px-2 py-0.5 bg-graphite-800 text-copper-400 font-mono font-bold rounded border border-graphite-700">⌘K</kbd>
              </div>
              <div className="bg-graphite-950 p-3 rounded-xl border border-graphite-800 flex justify-between items-center">
                <span className="text-graphite-300">Operations Center</span>
                <kbd className="px-2 py-0.5 bg-graphite-800 text-white font-mono font-bold rounded border border-graphite-700">G then O</kbd>
              </div>
              <div className="bg-graphite-950 p-3 rounded-xl border border-graphite-800 flex justify-between items-center">
                <span className="text-graphite-300">Decision Studio</span>
                <kbd className="px-2 py-0.5 bg-graphite-800 text-white font-mono font-bold rounded border border-graphite-700">G then D</kbd>
              </div>
              <div className="bg-graphite-950 p-3 rounded-xl border border-graphite-800 flex justify-between items-center">
                <span className="text-graphite-300">Policy Rules</span>
                <kbd className="px-2 py-0.5 bg-graphite-800 text-white font-mono font-bold rounded border border-graphite-700">G then R</kbd>
              </div>
              <div className="bg-graphite-950 p-3 rounded-xl border border-graphite-800 flex justify-between items-center">
                <span className="text-graphite-300">Investigation Cases</span>
                <kbd className="px-2 py-0.5 bg-graphite-800 text-white font-mono font-bold rounded border border-graphite-700">G then C</kbd>
              </div>
              <div className="bg-graphite-950 p-3 rounded-xl border border-graphite-800 flex justify-between items-center">
                <span className="text-graphite-300">Fraud Graph</span>
                <kbd className="px-2 py-0.5 bg-graphite-800 text-white font-mono font-bold rounded border border-graphite-700">G then G</kbd>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShortcutsModalOpen(false)}
                className="w-full py-2 bg-graphite-800 hover:bg-graphite-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Close Shortcuts
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
