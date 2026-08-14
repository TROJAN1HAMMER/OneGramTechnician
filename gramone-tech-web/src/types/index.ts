export interface User {
  id: number;
  email: string;
  role: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface DashboardSummary {
  online_devices: number;
  offline_devices: number;
  active_alerts: number;
  last_sync: string | null;
}

export interface Device {
  id: number;
  device_code: string;
  device_type: 'water' | 'bin' | 'environment' | 'rfid_button' | string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  status: 'online' | 'offline';
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Telemetry {
  id: number;
  device_id: number;
  device_code?: string;
  water_level?: number | null;
  fill_level?: number | null;
  temperature?: number | null;
  humidity?: number | null;
  battery_level?: number | null;
  raw_data?: Record<string, any> | null;
  timestamp: string;
}

export interface Alert {
  id: number;
  device_id: number;
  device_code?: string;
  location_name?: string;
  alert_type: string;
  severity: 'WARNING' | 'CRITICAL';
  message: string;
  status: 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED';
  acknowledged_at?: string | null;
  resolved_at?: string | null;
  acknowledged_by?: number | null;
  resolved_by?: number | null;
  created_at: string;
}

export interface AlertActionResponse {
  status: string;
  message: string;
  alert: Alert;
}

export interface AttendanceEvent {
  id: number;
  device_id: number;
  card_uid: string;
  scanned_at: string;
  device_code?: string;
}
