import { z } from "zod";

export const healthCheckSchema = z.object({
  status: z.string(),
  version: z.string(),
  database: z.string(),
  redis: z.string(),
  timestamp: z.string(),
});

export type HealthCheck = z.infer<typeof healthCheckSchema>;
