"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/validators/auth";
import { useAuth } from "@/hooks/useAuth";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Welcome back
        </h2>
        <p className="text-sm text-graphite-400 mt-1">
          Enter your enterprise credentials to access RiskShield AI.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-graphite-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="name@company.com"
              {...register("email")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-900 border border-graphite-700 text-graphite-100 text-sm placeholder-graphite-500 focus:outline-none focus:ring-2 focus:ring-copper-400 focus:border-copper-400 transition-colors pl-10"
            />
            <Mail className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
          )}
        </div>

        <PasswordInput
          label="Password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center space-x-2 cursor-pointer text-graphite-300">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="rounded bg-graphite-900 border-graphite-700 text-copper-500 focus:ring-copper-400 focus:ring-offset-graphite-950"
            />
            <span>Remember me for 30 days</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-copper-400 hover:text-copper-300 font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full py-3 px-4 bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-400 hover:to-copper-500 text-graphite-950 font-bold text-sm rounded-lg shadow-lg shadow-copper-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-graphite-950 border-t-transparent" />
              <span>Authenticating...</span>
            </div>
          ) : (
            <>
              <span>Sign In to Platform</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-graphite-400 pt-4 border-t border-graphite-800">
        Don&apos;t have an enterprise account?{" "}
        <Link
          href="/signup"
          className="text-copper-400 hover:text-copper-300 font-semibold transition-colors"
        >
          Request Signup
        </Link>
      </div>
    </div>
  );
}
