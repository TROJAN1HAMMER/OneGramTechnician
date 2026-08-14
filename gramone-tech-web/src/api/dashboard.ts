import client from './client';
import type { DashboardSummary } from '../types';

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await client.get<DashboardSummary>('/technician/dashboard');
  return response.data;
};
