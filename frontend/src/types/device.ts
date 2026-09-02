export interface Device {
  id: string;
  device_fingerprint: string;
  device_type: string;
  operating_system: string;
  browser: string;
  ip_address: string;
  country: string;
  state?: string;
  city?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  vpn_detected: boolean;
  rooted_device: boolean;
  jailbroken: boolean;
  emulator: boolean;
  first_seen: string;
  last_seen: string;
  transaction_count: number;
  failed_attempts: number;
  risk_flags: string[];
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedDevices {
  items: Device[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface DeviceFilterParams {
  search?: string;
  vpn_detected?: boolean;
  rooted_device?: boolean;
  jailbroken?: boolean;
  emulator?: boolean;
  device_type?: string;
  page?: number;
  size?: number;
  sort_by?: string;
  sort_dir?: string;
}
