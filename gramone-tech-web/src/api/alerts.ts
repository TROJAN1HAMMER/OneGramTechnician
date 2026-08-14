import client from './client';
import type { Alert, AlertActionResponse } from '../types';

export interface AlertQueryParams {
  status?: string;
  severity?: string;
  device_id?: number;
  limit?: number;
  offset?: number;
}

export const getAlerts = async (params?: AlertQueryParams): Promise<Alert[]> => {
  const response = await client.get<Alert[]>('/technician/alerts', { params });
  return response.data;
};

export const acknowledgeAlert = async (id: number): Promise<AlertActionResponse> => {
  const response = await client.patch<AlertActionResponse>(
    `/technician/alerts/${id}/acknowledge`
  );
  return response.data;
};

export const resolveAlert = async (id: number): Promise<AlertActionResponse> => {
  const response = await client.patch<AlertActionResponse>(
    `/technician/alerts/${id}/resolve`
  );
  return response.data;
};
