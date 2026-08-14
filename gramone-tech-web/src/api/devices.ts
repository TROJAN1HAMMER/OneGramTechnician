import client from './client';
import type { Device } from '../types';

export const getDevices = async (): Promise<Device[]> => {
  const response = await client.get<Device[]>('/technician/devices');
  return response.data;
};

export const getDeviceById = async (id: number): Promise<Device> => {
  const response = await client.get<Device>(`/technician/devices/${id}`);
  return response.data;
};
