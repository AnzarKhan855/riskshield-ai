import { z } from "zod";

export const merchantFormSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters").max(255),
  legal_business_name: z.string().min(2, "Legal business name is required").max(255),
  business_type: z.enum([
    "Sole Proprietorship",
    "Partnership",
    "Private Limited",
    "Public Limited",
    "LLC",
    "Other",
  ]),
  industry: z.string().min(2, "Industry is required").max(100),
  gst_number: z.string().optional(),
  pan_number: z.string().optional(),
  business_email: z.string().email("Invalid business email address"),
  business_phone: z.string().min(5, "Business phone number is required").max(50),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  country: z.string().min(2, "Country is required").default("India"),
  state: z.string().min(2, "State is required"),
  city: z.string().min(2, "City is required"),
  address: z.string().min(5, "Full address is required"),
  pincode: z.string().min(3, "Pincode is required"),
  status: z.enum(["Active", "Inactive", "Suspended", "Pending Approval"]).default("Pending Approval"),
  risk_level: z.enum(["Low", "Medium", "High", "Critical"]).default("Medium"),
  verification_status: z.enum(["Unverified", "Pending", "Verified", "Rejected"]).default("Pending"),
  kyc_status: z.enum(["Not Submitted", "Pending", "Approved", "Rejected"]).default("Not Submitted"),
});

export type MerchantFormData = z.infer<typeof merchantFormSchema>;
