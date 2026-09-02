"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import CaseForm from "@/components/cases/CaseForm";
import { useCreateCase } from "@/hooks/useCases";
import { CaseFormValues } from "@/validators/investigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateCasePage() {
  const createMutation = useCreateCase();
  const router = useRouter();

  const handleCreate = (values: CaseFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        router.push("/cases");
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
              href="/cases"
              className="p-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 hover:text-copper-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-copper-400 mb-1">
                <ShieldAlert className="w-4 h-4 text-copper-400" />
                <span>Enterprise Case Management</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Open New Investigation Case
              </h1>
              <p className="text-xs text-graphite-400 mt-1">
                Create an investigation workspace case for manual analyst review and evidence discovery.
              </p>
            </div>
          </div>

          <CaseForm onSubmit={handleCreate} isLoading={createMutation.isPending} />
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
