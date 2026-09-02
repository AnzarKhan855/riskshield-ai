"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { merchantFormSchema, MerchantFormData } from "@/validators/merchant";
import { Merchant } from "@/types/merchant";
import { Building2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface MerchantFormProps {
  initialData?: Merchant;
  onSubmit: (data: MerchantFormData) => void;
  isSubmitting: boolean;
  title: string;
}

export default function MerchantForm({
  initialData,
  onSubmit,
  isSubmitting,
  title,
}: MerchantFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MerchantFormData>({
    resolver: zodResolver(merchantFormSchema),
    defaultValues: {
      business_name: initialData?.business_name || "",
      legal_business_name: initialData?.legal_business_name || "",
      business_type: initialData?.business_type || "Private Limited",
      industry: initialData?.industry || "",
      gst_number: initialData?.gst_number || "",
      pan_number: initialData?.pan_number || "",
      business_email: initialData?.business_email || "",
      business_phone: initialData?.business_phone || "",
      website: initialData?.website || "",
      country: initialData?.country || "India",
      state: initialData?.state || "",
      city: initialData?.city || "",
      address: initialData?.address || "",
      pincode: initialData?.pincode || "",
      status: initialData?.status || "Pending Approval",
      risk_level: initialData?.risk_level || "Medium",
      verification_status: initialData?.verification_status || "Pending",
      kyc_status: initialData?.kyc_status || "Not Submitted",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/merchants"
            className="p-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 hover:text-gold-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
            <p className="text-xs text-graphite-400">Configure enterprise merchant parameters</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-graphite-950 font-semibold text-xs rounded-lg shadow-lg shadow-gold-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? "Saving..." : "Save Merchant"}</span>
        </button>
      </div>

      {/* Business Details Card */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gold-400 border-b border-graphite-800 pb-2">
          1. Business Identity
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Business Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Retail Solutions"
              {...register("business_name")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            {errors.business_name && (
              <p className="mt-1 text-xs text-rose-400">{errors.business_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Legal Business Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Retail Solutions Pvt Ltd"
              {...register("legal_business_name")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            {errors.legal_business_name && (
              <p className="mt-1 text-xs text-rose-400">{errors.legal_business_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Business Type *
            </label>
            <select
              {...register("business_type")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="Private Limited">Private Limited</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
              <option value="Partnership">Partnership</option>
              <option value="Public Limited">Public Limited</option>
              <option value="LLC">LLC</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Industry *
            </label>
            <input
              type="text"
              placeholder="e.g. E-Commerce & Fintech"
              {...register("industry")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            {errors.industry && (
              <p className="mt-1 text-xs text-rose-400">{errors.industry.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tax & Identifiers */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gold-400 border-b border-graphite-800 pb-2">
          2. Tax & Compliance Identifiers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              GST Number
            </label>
            <input
              type="text"
              placeholder="27AAAAA0000A1Z5"
              {...register("gst_number")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              PAN Number
            </label>
            <input
              type="text"
              placeholder="AAAAA0000A"
              {...register("pan_number")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Website
            </label>
            <input
              type="text"
              placeholder="https://example.com"
              {...register("website")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            {errors.website && (
              <p className="mt-1 text-xs text-rose-400">{errors.website.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact & Address */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gold-400 border-b border-graphite-800 pb-2">
          3. Contact & Address Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Business Email *
            </label>
            <input
              type="email"
              placeholder="contact@company.com"
              {...register("business_email")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            {errors.business_email && (
              <p className="mt-1 text-xs text-rose-400">{errors.business_email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Business Phone *
            </label>
            <input
              type="text"
              placeholder="+1 800 555 0199"
              {...register("business_phone")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            {errors.business_phone && (
              <p className="mt-1 text-xs text-rose-400">{errors.business_phone.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Address *
            </label>
            <input
              type="text"
              placeholder="101 Business Park, Avenue 4"
              {...register("address")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            {errors.address && (
              <p className="mt-1 text-xs text-rose-400">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              City *
            </label>
            <input
              type="text"
              placeholder="Mumbai"
              {...register("city")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            {errors.city && (
              <p className="mt-1 text-xs text-rose-400">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              State *
            </label>
            <input
              type="text"
              placeholder="Maharashtra"
              {...register("state")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            {errors.state && (
              <p className="mt-1 text-xs text-rose-400">{errors.state.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Country *
            </label>
            <input
              type="text"
              {...register("country")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Pincode *
            </label>
            <input
              type="text"
              placeholder="400051"
              {...register("pincode")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            {errors.pincode && (
              <p className="mt-1 text-xs text-rose-400">{errors.pincode.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Risk & Status Settings */}
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gold-400 border-b border-graphite-800 pb-2">
          4. Operational Risk & Status Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Account Status
            </label>
            <select
              {...register("status")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="Active">Active</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Risk Classification Level
            </label>
            <select
              {...register("risk_level")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
              <option value="Critical">Critical Risk</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Verification Status
            </label>
            <select
              {...register("verification_status")}
              className="w-full px-3.5 py-2.5 rounded-lg bg-graphite-950 border border-graphite-700 text-graphite-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="Unverified">Unverified</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  );
}
