import { z } from "zod";

export const predictionFormSchema = z.object({
  transaction_id: z.string().min(3, "Transaction ID is required"),
  model_type: z.enum([
    "Fraud Detection",
    "Chargeback Prediction",
    "Merchant Risk",
    "Customer Risk",
    "Device Risk",
    "Behaviour Analysis",
  ]),
  feature_vector_id: z.string().optional(),
});

export type PredictionFormValues = z.infer<typeof predictionFormSchema>;
