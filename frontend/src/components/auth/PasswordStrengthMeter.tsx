"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password?: string;
}

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const pwd = password || "";

  const calculateScore = (value: string): number => {
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[a-z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    return score;
  };

  const score = calculateScore(pwd);

  const getLabel = (s: number) => {
    if (pwd.length === 0) return "";
    if (s <= 2) return "Weak";
    if (s === 3 || s === 4) return "Good";
    return "Strong";
  };

  const getColor = (s: number) => {
    if (s <= 2) return "bg-rose-500";
    if (s === 3 || s === 4) return "bg-gold-500";
    return "bg-emerald-500";
  };

  if (!pwd) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-graphite-400">Password Strength</span>
        <span className={cn("font-medium", score <= 2 ? "text-rose-400" : score <= 4 ? "text-gold-400" : "text-emerald-400")}>
          {getLabel(score)}
        </span>
      </div>
      <div className="h-1.5 w-full bg-graphite-800 rounded-full overflow-hidden flex gap-1">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={cn(
              "h-full flex-1 transition-all duration-300 rounded-full",
              step <= score ? getColor(score) : "bg-graphite-800"
            )}
          />
        ))}
      </div>
    </div>
  );
}
