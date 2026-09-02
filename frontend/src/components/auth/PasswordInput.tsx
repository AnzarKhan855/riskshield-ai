"use client";

import React, { forwardRef, useState, InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, label, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-graphite-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className={cn(
              "w-full px-3.5 py-2.5 rounded-lg bg-graphite-900 border border-graphite-700 text-graphite-100 text-sm placeholder-graphite-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors pr-10",
              error && "border-rose-500 focus:ring-rose-500",
              className
            )}
            ref={ref}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-graphite-400 hover:text-gold-400 focus:outline-none transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
