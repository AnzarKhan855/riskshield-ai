"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import TransactionForm from "@/components/transactions/TransactionForm";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { TransactionFormData } from "@/validators/transaction";

export default function NewTransactionPage() {
  const createMutation = useCreateTransaction();

  const handleSubmit = (data: TransactionFormData) => {
    createMutation.mutate(data);
  };

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="space-y-6">
          <TransactionForm
            title="Create New Transaction"
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
          />
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
