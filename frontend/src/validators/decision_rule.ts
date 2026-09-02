import { z } from "zod";

export const ruleFormSchema = z.object({
  rule_name: z.string().min(2, "Rule name must be at least 2 characters").max(100),
  rule_category: z.enum([
    "MERCHANT",
    "CUSTOMER",
    "TRANSACTION",
    "COUNTRY",
    "VELOCITY",
    "PAYMENT_METHOD",
    "COMPLIANCE",
    "REGULATORY",
    "AMOUNT",
    "TIME",
    "DEVICE",
    "BEHAVIOUR",
  ]),
  priority: z.number().min(1).max(1000),
  version: z.string().default("v1.0.0"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  description: z.string().optional(),
  expression: z.string().min(3, "Boolean rule expression is required"),
  action: z.enum(["APPROVE", "REVIEW", "BLOCK", "ESCALATE"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("HIGH"),
  enabled: z.boolean().default(true),
  created_by: z.string().min(2).default("Risk Policy Team"),
});

export type RuleFormValues = z.infer<typeof ruleFormSchema>;
