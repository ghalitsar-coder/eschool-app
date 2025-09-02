import { Eschool } from '@/types/api';
import apiClient from '@/lib/api/client';

// Helper function to ensure schedule_days is always an array
const normalizeEschool = (eschool: Eschool): Eschool => {
  return {
    ...eschool,
    schedule_days: Array.isArray(eschool.schedule_days) ? eschool.schedule_days : [],
  };
};

// Helper function to normalize array of eschools
const normalizeEschools = (eschools: Eschool[]): Eschool[] => {
  return eschools.map(normalizeEschool);
};

export const fetchEschool = async (id: number): Promise<Eschool> => {
  const response = await apiClient.get<Eschool>(`/eschools/${id}`);
  return normalizeEschool(response.data);
};