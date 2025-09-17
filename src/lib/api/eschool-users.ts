import { ApiResponse, User } from "@/types/api"
import apiClient from "./client"

// Get eligible members for a school (students who can be selected as treasurer)
export const getEligibleTreasurers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/supervisor/eligible-treasurers');
  
  return response.data.data || [];
}

// Get eligible coordinators (teachers who are not already coordinators of other eschools)
export const getEligibleCoordinators = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/supervisor/eligible-coordinators');
  
  return response.data.data || [];
}