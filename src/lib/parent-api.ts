import { apiClient } from './api-client';

export async function fetchParentDashboard() {
  const { data } = await apiClient('/parents/dashboard');
  return data;
}
