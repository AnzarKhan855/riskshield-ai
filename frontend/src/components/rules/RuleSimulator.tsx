"use client";

import React, { useState } from "react";
import { Play, Terminal, CheckCircle2, XCircle, Code2 } from "lucide-react";

export default function RuleSimulator() {
  const [expr, setExpr] = useState("composite_risk_score >= 70.0 and loc_is_high_risk_country == True");
  const [testScore, setTestScore] = useState(85.0);
  const [testAmount, setTestAmount] = useState(2500.0);
  const [isHighRisk, setIsHighRisk] = useState(true);
  const [isVpn, setIsVpn] = useState(false);
  const [simResult, setSimResult] = useState<{ matched: boolean; message: string } | null>(null);

  const handleSimulate = () => {
    try {
      // Safe client-side rule evaluation replacing Python boolean keywords with JS operators
      let jsExpr = expr
        .replace(/\band\b/gi, "&&")
        .replace(/\bor\b/gi, "||")
        .replace(/\bnot\b/gi, "!")
        .replace(/\bTrue\b/g, "true")
        .replace(/\bFalse\b/g, "false");

      // Replace known variable names with simulated values
      jsExpr = jsExpr
        .replace(/\bcomposite_risk_score\b/g, String(testScore))
        .replace(/\btxn_amount\b/g, String(testAmount))
        .replace(/\bloc_is_high_risk_country\b/g, String(isHighRisk))
        .replace(/\bdev_vpn_detected\b/g, String(isVpn));

      // Disallow dangerous JS keywords
      const forbidden = ["window", "document", "localStorage", "fetch", "alert", "eval", "Function", "constructor"];
      for (const f of forbidden) {
        if (expr.includes(f)) {
          throw new Error(`Forbidden keyword '${f}' detected in policy expression.`);
        }
      }

      // Evaluate safely
      const evaluator = new Function(`return Boolean(${jsExpr});`);
      const matched = evaluator();

      setSimResult({
        matched,
        message: matched
          ? `MATCHED! Policy expression evaluated to TRUE with current parameters.`
          : `NOT MATCHED! Policy expression evaluated to FALSE with current parameters.`,
      });
    } catch (e: any) {
      setSimResult({ matched: false, message: `Syntax Evaluation Error: ${e.message}` });
    }
  };

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
        <Terminal className="w-5 h-5 text-copper-400" />
        <h3 className="text-sm font-semibold text-white">Rule Studio Real-time Expression Simulator</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block font-semibold text-graphite-300 text-xs mb-1">Target Policy Expression</label>
          <input
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-copper-400 font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-graphite-300 mb-1">Score (`composite_risk_score`)</label>
            <input
              type="number"
              value={testScore}
              onChange={(e) => setTestScore(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-graphite-950 border border-graphite-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-graphite-300 mb-1">Amount (`txn_amount`)</label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-graphite-950 border border-graphite-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center space-x-2 text-xs text-graphite-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isHighRisk}
                onChange={(e) => setIsHighRisk(e.target.checked)}
                className="rounded bg-graphite-950 border-graphite-700 text-copper-500 focus:ring-copper-400"
              />
              <span className="font-mono text-[11px]">loc_is_high_risk_country</span>
            </label>
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center space-x-2 text-xs text-graphite-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isVpn}
                onChange={(e) => setIsVpn(e.target.checked)}
                className="rounded bg-graphite-950 border-graphite-700 text-copper-500 focus:ring-copper-400"
              />
              <span className="font-mono text-[11px]">dev_vpn_detected</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2 text-[11px] font-mono text-graphite-400">
          <Code2 className="w-3.5 h-3.5 text-copper-400" />
          <span>Supported: txn_amount, composite_risk_score, loc_is_high_risk_country, dev_vpn_detected</span>
        </div>

        <button
          onClick={handleSimulate}
          className="px-4 py-2 bg-copper-500 hover:bg-copper-400 text-graphite-950 font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-graphite-950" />
          <span>Run Simulation</span>
        </button>
      </div>

      {simResult && (
        <div
          className={`p-3 rounded-lg border text-xs font-mono flex items-center space-x-2 ${
            simResult.matched
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          {simResult.matched ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          <span>{simResult.message}</span>
        </div>
      )}
    </div>
  );
}
