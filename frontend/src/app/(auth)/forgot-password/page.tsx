"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
  resetPasswordSchema,
  ResetPasswordFormData,
} from "@/validators/auth";
import { useAuth } from "@/hooks/useAuth";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Mail, KeyRound, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { forgotPassword, isRequestingReset, resetPassword, isResettingPassword } = useAuth();
  const [resetTokenGenerated, setResetTokenGenerated] = useState<string | null>(null);

  const forgotForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: "", new_password: "" },
  });

  const onForgotSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword(data, {
      onSuccess: (res: any) => {
        if (res?.data?.reset_token) {
          setResetTokenGenerated(res.data.reset_token);
          resetForm.setValue("token", res.data.reset_token);
        }
      },
    });
  };

  const onResetSubmit = (data: ResetPasswordFormData) => {
    resetPassword(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {resetTokenGenerated ? "Set New Password" : "Reset Your Password"}
        </h2>
        <p className="text-sm text-graphite-400 mt-1">
          {resetTokenGenerated
            ? "Enter your new secure password below to complete reset."
            : "Enter your registered work email to receive password reset instructions."}
        </p>
      </div>

      {!resetTokenGenerated ? (
        <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@company.com"
                {...forgotForm.register("email")}
                className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-900 border border-graphite-700 text-graphite-100 text-sm placeholder-graphite-500 focus:outline-none focus:ring-2 focus:ring-copper-400 focus:border-copper-400 transition-colors pl-10"
              />
              <Mail className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {forgotForm.formState.errors.email && (
              <p className="mt-1 text-xs text-rose-400">
                {forgotForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isRequestingReset}
            className="w-full py-3 px-4 bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-400 hover:to-copper-500 text-graphite-950 font-bold text-sm rounded-lg shadow-lg shadow-copper-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRequestingReset ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-graphite-950 border-t-transparent" />
                <span>Processing Request...</span>
              </div>
            ) : (
              <>
                <span>Send Reset Request</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-5">
          <div className="p-3.5 rounded-lg bg-copper-500/10 border border-copper-500/20 text-copper-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-copper-400 shrink-0" />
            <span>Reset token generated. Enter new password to execute.</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Reset Token
            </label>
            <div className="relative">
              <input
                type="text"
                {...resetForm.register("token")}
                className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-900 border border-graphite-700 text-graphite-100 text-xs font-mono placeholder-graphite-500 focus:outline-none focus:ring-2 focus:ring-copper-400 focus:border-copper-400 transition-colors pl-10"
              />
              <KeyRound className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {resetForm.formState.errors.token && (
              <p className="mt-1 text-xs text-rose-400">
                {resetForm.formState.errors.token.message}
              </p>
            )}
          </div>

          <PasswordInput
            label="New Password"
            placeholder="••••••••"
            error={resetForm.formState.errors.new_password?.message}
            {...resetForm.register("new_password")}
          />

          <button
            type="submit"
            disabled={isResettingPassword}
            className="w-full py-3 px-4 bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-400 hover:to-copper-500 text-graphite-950 font-bold text-sm rounded-lg shadow-lg shadow-copper-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResettingPassword ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-graphite-950 border-t-transparent" />
                <span>Resetting Password...</span>
              </div>
            ) : (
              <>
                <span>Confirm Password Reset</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      <div className="text-center text-xs text-graphite-400 pt-4 border-t border-graphite-800">
        <Link
          href="/login"
          className="inline-flex items-center space-x-1.5 text-copper-400 hover:text-copper-300 font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
