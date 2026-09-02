import { z } from "zod";

export const explanationGenerateSchema = z.object({
  decision_id: z.string().min(3, "Decision ID is required"),
});

export type ExplanationGenerateFormValues = z.infer<typeof explanationGenerateSchema>;
