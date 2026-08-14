import client from './client';
import type { Telemetry } from '../types';

export const getEnvironmentLatest = async (): Promise<Telemetry | null> => {
  try {
    const response = await client.get<Telemetry>('/technician/environment/latest');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

export const getEnvironmentHistory = async (
  deviceCode?: string,
  limit: number = 50
): Promise<Telemetry[]> => {
  const response = await client.get<Telemetry[]>('/technician/environment/history', {
    params: { device_code: deviceCode, limit },
  });
  return response.data;
};
