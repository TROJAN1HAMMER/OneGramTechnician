import client from './client';
import type { Telemetry } from '../types';

export const getBinLatest = async (): Promise<Telemetry | null> => {
  try {
    const response = await client.get<Telemetry>('/technician/bin/latest');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

export const getBinHistory = async (
  deviceCode?: string,
  limit: number = 50
): Promise<Telemetry[]> => {
  const response = await client.get<Telemetry[]>('/technician/bin/history', {
    params: { device_code: deviceCode, limit },
  });
  return response.data;
};
