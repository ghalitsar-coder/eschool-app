import { ApiResponse } from "@/types/api";
import apiClient from "./client";

// Define types for school
export interface School {
  id: number;
  name: string;
  address?: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Fetch all schools
export const fetchSchools = async (): Promise<School[]> => {
  const response = await apiClient.get<School[]>("/schools");
  return response.data || [];
};