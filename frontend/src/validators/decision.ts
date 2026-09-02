import { z } from "zod";

export const decisionEvaluateFormSchema = z.object({
  transaction_id: z.string().min(3, "Transaction ID is required"),
  composite_prediction_id: z.string().optional(),
});

export type DecisionEvaluateFormValues = z.infer<typeof decisionEvaluateFormSchema>;
