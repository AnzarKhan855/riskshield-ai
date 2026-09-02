import { z } from "zod";

export const operationsFilterSchema = z.object({
  workspace: z.string().default("Global Enterprise"),
  refresh_interval: z.number().default(5000),
});

export type OperationsFilterFormValues = z.infer<typeof operationsFilterSchema>;
