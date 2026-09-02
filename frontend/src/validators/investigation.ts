import { z } from "zod";

export const caseFormSchema = z.object({
  transaction_id: z.string().min(3, "Transaction ID is required"),
  decision_id: z.string().optional(),
  category: z.enum([
    "Fraud",
    "Chargeback",
    "AML",
    "Compliance",
    "Identity",
    "Merchant Abuse",
    "Promotion Abuse",
  ]).default("Fraud"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("HIGH"),
  case_title: z.string().min(3, "Case title is required").max(255),
  case_description: z.string().optional(),
});

export type CaseFormValues = z.infer<typeof caseFormSchema>;

export const caseResolveSchema = z.object({
  resolution: z.enum(["APPROVE", "REJECT", "ESCALATE", "CLOSE"]),
  resolution_notes: z.string().min(5, "Resolution notes are required (min 5 chars)"),
});

export type CaseResolveValues = z.infer<typeof caseResolveSchema>;

export const caseCommentSchema = z.object({
  comment: z.string().min(2, "Comment text is required").max(1000),
});

export type CaseCommentValues = z.infer<typeof caseCommentSchema>;
