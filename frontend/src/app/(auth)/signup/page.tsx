"use client";

import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupFormData } from "@/validators/auth";
import { useAuth } from "@/hooks/useAuth";
import { PasswordInput } from "@/components/auth/PasswordInput";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";
import { Mail, User, Phone, Shield, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const { signup, isSigningUp } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "Merchant",
      password: "",
    },
  });

  const passwordValue = useWatch({
    control,
    name: "password",
  });

  const onSubmit = (data: SignupFormData) => {
    signup(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Create Enterprise Account
        </h2>
        <p className="text-sm text-graphite-400 mt-1">
          Register your organization persona on RiskShield AI.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              First Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="John"
                {...register("first_name")}
                className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-900 border border-graphite-700 text-graphite-100 text-sm placeholder-graphite-500 focus:outline-none focus:ring-2 focus:ring-copper-400 focus:border-copper-400 transition-colors pl-10"
              />
              <User className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {errors.first_name && (
              <p className="mt-1 text-xs text-rose-400">{errors.first_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Last Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Doe"
                {...register("last_name")}
                className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-900 border border-graphite-700 text-graphite-100 text-sm placeholder-graphite-500 focus:outline-none focus:ring-2 focus:ring-copper-400 focus:border-copper-400 transition-colors pl-10"
              />
              <User className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {errors.last_name && (
              <p className="mt-1 text-xs text-rose-400">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-graphite-300 mb-1.5">
            Work Email Address
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="+1 234 567 890"
                {...register("phone")}
                className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-900 border border-graphite-700 text-graphite-100 text-sm placeholder-graphite-500 focus:outline-none focus:ring-2 focus:ring-copper-400 focus:border-copper-400 transition-colors pl-10"
              />
              <Phone className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Account Role
            </label>
            <div className="relative">
              <select
                {...register("role")}
                className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-900 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-copper-400 focus:border-copper-400 transition-colors pl-10 appearance-none"
              >
                <option value="Merchant">Merchant Persona</option>
                <option value="Analyst">Analyst Persona</option>
                <option value="Admin">Administrator Persona</option>
              </select>
              <Shield className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.role && (
              <p className="mt-1 text-xs text-rose-400">{errors.role.message}</p>
            )}
          </div>
        </div>

        <div>
          <PasswordInput
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrengthMeter password={passwordValue} />
        </div>

        <button
          type="submit"
          disabled={isSigningUp}
          className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-400 hover:to-copper-500 text-graphite-950 font-bold text-sm rounded-lg shadow-lg shadow-copper-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSigningUp ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-graphite-950 border-t-transparent" />
              <span>Creating Account...</span>
            </div>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-graphite-400 pt-4 border-t border-graphite-800">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-copper-400 hover:text-copper-300 font-semibold transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
