import React, { ReactNode } from "react";
import ThemeToggle from "@/components/common/ThemeToggle";
import { ShieldCheck, Lock, Cpu, CheckCircle } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-graphite-950 text-graphite-100 flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      {/* Left Brand Panel */}
      <div className="lg:w-1/2 p-6 sm:p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-graphite-950 via-graphite-900 to-graphite-950 border-r border-graphite-800/60 w-full min-w-0">
        {/* Glow Overlay */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold shadow-lg shadow-gold-500/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              RiskShield <span className="text-gold-400">AI</span>
            </span>
          </div>
          <ThemeToggle />
        </div>

        <div className="relative z-10 my-8 lg:my-0 max-w-lg">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-semibold mb-6">
            <Cpu className="w-3.5 h-3.5" />
            <span>Enterprise Security Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Unified Risk Intelligence & Authentication Platform
          </h1>
          <p className="text-graphite-400 text-sm sm:text-base leading-relaxed mb-8">
            Empower your enterprise with production-grade identity management, Role-Based Access Control (RBAC), and continuous token security.
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-gold-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-white">Zero-Trust JWT Token Rotation</h4>
                <p className="text-xs text-graphite-400">Automatic sliding refresh token rotation with immediate revocation support.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-gold-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-white">Role-Based Access Control (RBAC)</h4>
                <p className="text-xs text-graphite-400">Strict granular permissions for Admin, Merchant, and Analyst personas.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-gold-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-white">Audit & Compliance Trail</h4>
                <p className="text-xs text-graphite-400">Real-time security auditing logging IP, User-Agent, and action traces.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-graphite-400 mt-8 lg:mt-0 font-mono">
          &copy; {new Date().getFullYear()} RiskShield AI Platform. All rights reserved.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="lg:w-1/2 p-6 sm:p-8 lg:p-16 flex items-center justify-center relative w-full min-w-0">
        <div className="max-w-md w-full">{children}</div>
      </div>
    </div>
  );
}
