export interface SystemHealth {
  status: string;
  version: string;
  database: string;
  redis: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
