import { z } from "zod";

export const eventPublishSchema = z.object({
  event_type: z.string().min(1, "Event Type is required"),
  source: z.string().default("API"),
  payload: z.record(z.any()).default({}),
});

export type EventPublishFormValues = z.infer<typeof eventPublishSchema>;
