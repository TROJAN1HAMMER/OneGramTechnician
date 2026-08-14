import client from './client';
import type { Telemetry } from '../types';

export const getWaterLatest = async (): Promise<Telemetry | null> => {
  try {
    const response = await client.get<Telemetry>('/technician/water/latest');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

export const getWaterHistory = async (
  deviceCode?: string,
  limit: number = 50
): Promise<Telemetry[]> => {
  const response = await client.get<Telemetry[]>('/technician/water/history', {
    params: { device_code: deviceCode, limit },
  });
  return response.data;
};
