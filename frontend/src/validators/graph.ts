import { z } from "zod";

export const graphExpandSchema = z.object({
  node_id: z.string().min(1, "Target Node ID is required"),
  depth: z.number().min(1).max(5).default(1),
});

export type GraphExpandFormValues = z.infer<typeof graphExpandSchema>;
