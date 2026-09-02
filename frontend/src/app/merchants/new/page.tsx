"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import MerchantForm from "@/components/merchants/MerchantForm";
import { useCreateMerchant } from "@/hooks/useMerchants";
import { MerchantFormData } from "@/validators/merchant";

export default function NewMerchantPage() {
  const createMutation = useCreateMerchant();

  const handleSubmit = (data: MerchantFormData) => {
    createMutation.mutate(data);
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          <MerchantForm
            title="Register New Merchant"
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
          />
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
