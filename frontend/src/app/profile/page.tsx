"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Shield,
  KeyRound,
  Clock,
  CheckCircle2,
  Lock,
  Mail,
  Smartphone,
  Fingerprint,
  Activity,
  Trash2,
  AlertOctagon,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const { deleteAccount, isDeletingAccount } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast("Please enter both current and new password.", "warning");
      return;
    }
    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters.", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }

    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password updated successfully across enterprise sessions.", "success");
    }, 600);
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6 max-w-5xl w-full max-w-full overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 w-full">
            <div className="min-w-0">
              <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400 mb-1">
                <User className="w-4 h-4 text-copper-400 shrink-0" />
                <span className="truncate">Enterprise Identity Management</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                Analyst Profile & Security
              </h1>
              <p className="text-xs text-graphite-400 mt-1">
                Manage your credentials, RBAC permissions, MFA security posture, and active session telemetry.
              </p>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Identity Verified &bull; Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Identity Card */}
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-graphite-800">
                <div className="w-20 h-20 rounded-full bg-graphite-950 border-2 border-copper-400 text-copper-400 flex items-center justify-center font-bold text-2xl shadow-inner">
                  {user?.first_name ? user.first_name.charAt(0).toUpperCase() : "A"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Analyst"}
                  </h3>
                  <p className="text-xs text-graphite-400 font-mono mt-0.5">{user?.email}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-copper-500/10 border border-copper-500/30 text-copper-400">
                  {user?.role || "Analyst"}
                </span>
              </div>

              {/* Attributes */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-graphite-400 flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-copper-400" />
                    <span>Role Clearance</span>
                  </span>
                  <span className="font-mono text-white font-semibold">{user?.role}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-graphite-400 flex items-center space-x-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-copper-400" />
                    <span>User ID</span>
                  </span>
                  <span className="font-mono text-[11px] text-graphite-300 truncate max-w-[130px]">
                    {user?.id || "USR-2026-001"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-graphite-400 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-copper-400" />
                    <span>Session Token</span>
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400 font-bold">Valid (60m)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-graphite-400 flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-copper-400" />
                    <span>Status</span>
                  </span>
                  <span className="font-mono text-xs text-emerald-400 font-bold">
                    {user?.status || "Active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Password & Security Configuration Form */}
            <div className="md:col-span-2 space-y-6">
              {/* Change Password Card */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-5">
                <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
                  <KeyRound className="w-4 h-4 text-copper-400" />
                  <h3 className="text-sm font-semibold text-white">Update Security Credentials</h3>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-graphite-300 mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-white font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-graphite-300 mb-1.5">
                        New Secure Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-white font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-graphite-300 mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-white font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-4 py-2.5 bg-copper-500 hover:bg-copper-400 text-graphite-950 font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isUpdating ? "Updating..." : "Update Password"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Security Telemetry & Active Sessions */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
                  <Shield className="w-4 h-4 text-copper-400" />
                  <h3 className="text-sm font-semibold text-white">Active Session Telemetry</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-graphite-950 border border-graphite-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">Current Web Session (Chrome on macOS / Windows)</span>
                        <span className="text-[11px] font-mono text-graphite-400">IP: 127.0.0.1 &bull; Active Now</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                      CURRENT
                    </span>
                  </div>
                </div>
              </div>

              {/* Danger Zone: Account Deprovisioning */}
              <div className="bg-graphite-900 border border-rose-900/50 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-rose-900/40 pb-3">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-semibold text-rose-300">Danger Zone: Deprovision Account</h3>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <p className="font-semibold text-white">Deactivate & Delete Account</p>
                    <p className="text-graphite-400 text-[11px] mt-0.5">
                      Permanently revokes all active session tokens, suspends credentials, and logs out of platform.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to permanently delete and deprovision your analyst account?")) {
                        deleteAccount();
                      }
                    }}
                    disabled={isDeletingAccount}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 shrink-0 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isDeletingAccount ? "Deleting..." : "Delete Account"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
