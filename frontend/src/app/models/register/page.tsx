"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import ModelForm from "@/components/models/ModelForm";
import { useRegisterModel } from "@/hooks/useModels";
import { ModelRegisterFormValues } from "@/validators/model_registry";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterModelPage() {
  const registerMutation = useRegisterModel();
  const router = useRouter();

  const handleSubmit = (values: ModelRegisterFormValues) => {
    registerMutation.mutate(values, {
      onSuccess: () => {
        router.push("/models");
      },
    });
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <Link
              href="/models"
              className="p-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 hover:text-copper-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Register New Model Artifact</h1>
              <p className="text-xs text-graphite-400">
                Register a newly trained model artifact into the RiskShield AI ModelRegistry platform.
              </p>
            </div>
          </div>

          <ModelForm onSubmit={handleSubmit} isLoading={registerMutation.isPending} />
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
