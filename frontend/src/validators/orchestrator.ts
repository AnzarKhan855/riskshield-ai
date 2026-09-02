import { z } from "zod";

export const orchestratorFormSchema = z.object({
  transaction_id: z.string().min(3, "Transaction ID is required"),
});

export type OrchestratorFormValues = z.infer<typeof orchestratorFormSchema>;
