import { z } from "zod";

export const customerFormSchema = z.object({
  merchant_id: z.string().uuid("Please select a valid merchant"),
  full_name: z.string().min(2, "Full name must be at least 2 characters").max(255),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  country: z.string().min(1).default("United States"),
  state: z.string().optional(),
  city: z.string().optional(),
  preferred_payment_method: z.string().optional(),
  risk_flags: z.array(z.string()).default([]),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;
