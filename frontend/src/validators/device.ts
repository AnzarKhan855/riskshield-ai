import { z } from "zod";

export const deviceFormSchema = z.object({
  device_type: z.string().min(1).default("Desktop"),
  operating_system: z.string().min(1).default("Windows"),
  browser: z.string().min(1).default("Chrome"),
  ip_address: z.string().min(1, "IP address is required"),
  country: z.string().min(1).default("United States"),
  state: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  vpn_detected: z.boolean().default(false),
  rooted_device: z.boolean().default(false),
  jailbroken: z.boolean().default(false),
  emulator: z.boolean().default(false),
  risk_flags: z.array(z.string()).default([]),
});

export type DeviceFormData = z.infer<typeof deviceFormSchema>;
