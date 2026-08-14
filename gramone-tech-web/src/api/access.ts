import client from './client';
import type { AttendanceEvent } from '../types';

export const getRfidHistory = async (deviceCode?: string): Promise<AttendanceEvent[]> => {
  const params = deviceCode ? { device_code: deviceCode } : {};
  const response = await client.get<AttendanceEvent[]>('/technician/rfid/history', { params });
  return response.data;
};
