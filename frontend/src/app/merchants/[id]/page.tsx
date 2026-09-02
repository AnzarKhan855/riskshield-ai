"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import MerchantForm from "@/components/merchants/MerchantForm";
import { useMerchant, useUpdateMerchant } from "@/hooks/useMerchants";
import { MerchantFormData } from "@/validators/merchant";
import { Building2, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MerchantDetailsPageProps {
  params: { id: string };
}

export default function MerchantDetailsPage({ params }: MerchantDetailsPageProps) {
  const { id } = params;
  const { data: merchant, isLoading, error } = useMerchant(id);
  const updateMutation = useUpdateMerchant(id);

  const handleSubmit = (data: MerchantFormData) => {
    updateMutation.mutate(data);
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
          ) : error || !merchant ? (
            <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Merchant Not Found</h2>
              <p className="text-xs text-graphite-400">
                The requested merchant ID could not be located or has been archived.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Profile Summary Bar */}
              <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-bold text-white">{merchant.business_name}</h2>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-graphite-800 text-gold-400 border border-graphite-700">
                        {merchant.merchant_code}
                      </span>
                    </div>
                    <p className="text-xs text-graphite-400 mt-0.5">
                      {merchant.legal_business_name} &bull; Registered {new Date(merchant.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold border",
                      merchant.status === "Active" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                      merchant.status === "Pending Approval" && "bg-gold-500/10 border-gold-500/30 text-gold-400",
                      merchant.status === "Suspended" && "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    )}
                  >
                    {merchant.status}
                  </span>

                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold border",
                      merchant.risk_level === "Low" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                      merchant.risk_level === "Medium" && "bg-gold-500/10 border-gold-500/30 text-gold-400",
                      merchant.risk_level === "High" && "bg-amber-500/10 border-amber-500/30 text-amber-400",
                      merchant.risk_level === "Critical" && "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    )}
                  >
                    {merchant.risk_level} Risk
                  </span>
                </div>
              </div>

              {/* Edit Form */}
              <MerchantForm
                title="Edit Merchant Profile"
                initialData={merchant}
                onSubmit={handleSubmit}
                isSubmitting={updateMutation.isPending}
              />
            </div>
          )}
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  );
}
