"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import RuleForm from "@/components/rules/RuleForm";
import { useCreateRule } from "@/hooks/useRules";
import { RuleFormValues } from "@/validators/decision_rule";
import { Sliders, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthorNewRulePage() {
  const createMutation = useCreateRule();
  const router = useRouter();

  const handleCreate = (values: RuleFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        router.push("/rules");
      },
    });
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center space-x-3 mb-8">
            <Link
              href="/rules"
              className="p-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 hover:text-copper-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400 mb-1">
                <Sliders className="w-4 h-4 text-copper-400" />
                <span>Enterprise Rule Studio</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Author New Decision Rule
              </h1>
              <p className="text-xs text-graphite-400 mt-1">
                Configure rule logic, priority hierarchy, severity level, and decision action.
              </p>
            </div>
          </div>

          <RuleForm onSubmit={handleCreate} isLoading={createMutation.isPending} />
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
