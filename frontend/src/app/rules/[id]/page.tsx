"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import RuleForm from "@/components/rules/RuleForm";
import { useRuleDetail, useUpdateRule, usePublishRule } from "@/hooks/useRules";
import { RuleFormValues } from "@/validators/decision_rule";
import { Sliders, ArrowLeft, Power, AlertCircle, Clock, Code, History } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface RuleDetailPageProps {
  params: { id: string };
}

export default function RuleDetailPage({ params }: RuleDetailPageProps) {
  const { id } = params;
  const { data: record, isLoading, error } = useRuleDetail(id);
  const updateMutation = useUpdateRule();
  const publishMutation = usePublishRule();

  const handleUpdate = (values: RuleFormValues) => {
    if (record) {
      updateMutation.mutate({ id: record.rule_id, values });
    }
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-8 space-y-4 animate-pulse">
              <div className="h-8 bg-graphite-800 rounded w-1/3" />
              <div className="h-64 bg-graphite-800/50 rounded-xl" />
            </div>
          ) : error || !record ? (
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Decision Rule Not Found</h2>
              <p className="text-xs text-graphite-400">
                The requested decision rule <span className="font-mono text-copper-400">{id}</span> could not be located.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <Link
                    href="/rules"
                    className="p-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 hover:text-copper-400 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h1 className="text-2xl font-bold text-white">{record.rule_name}</h1>
                      <span className="font-mono text-xs font-semibold text-copper-400">{record.rule_id}</span>
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border",
                          record.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-graphite-800 text-graphite-400 border-graphite-700"
                        )}
                      >
                        {record.status}
                      </span>
                    </div>
                    <p className="text-xs text-graphite-400 mt-0.5">
                      Category: <span className="font-mono text-white">{record.rule_category}</span> &bull; Version {record.version} &bull; Priority P-{record.priority}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => publishMutation.mutate(record.rule_id)}
                  disabled={publishMutation.isPending || record.status === "PUBLISHED"}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5 disabled:opacity-40"
                >
                  <Power className="w-4 h-4" />
                  <span>{record.status === "PUBLISHED" ? "Rule Published" : "Publish Rule"}</span>
                </button>
              </div>

              {/* Expression Viewer */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-copper-400 flex items-center space-x-1.5">
                    <Code className="w-3.5 h-3.5" />
                    <span>Compiled Boolean Specification Expression</span>
                  </span>
                  <span className="text-xs font-mono text-graphite-400">Action: {record.action}</span>
                </div>
                <div className="p-3 bg-graphite-950 rounded-lg border border-graphite-800 font-mono text-xs text-copper-400">
                  {record.expression}
                </div>
              </div>

              {/* Version History Timeline */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-white border-b border-graphite-800 pb-2">
                  <History className="w-4 h-4 text-copper-400" />
                  <span>Rule Version Audit Timeline</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-graphite-800/50">
                    <span className="font-mono text-copper-400">{record.version}</span>
                    <span className="text-graphite-300">Published by {record.created_by}</span>
                    <span className="text-graphite-400 font-mono text-[11px]">
                      {new Date(record.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <RuleForm
                onSubmit={handleUpdate}
                isLoading={updateMutation.isPending}
                initialValues={{
                  rule_name: record.rule_name,
                  rule_category: record.rule_category as any,
                  priority: record.priority,
                  version: record.version,
                  status: record.status as any,
                  description: record.description || "",
                  expression: record.expression,
                  action: record.action as any,
                  severity: record.severity as any,
                  enabled: record.enabled,
                  created_by: record.created_by,
                }}
              />
            </div>
          )}
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
