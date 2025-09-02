import { ApiResponse, User } from "@/types/api"
import apiClient from "./client"

// Get eligible members for a school (students who can be selected as treasurer)
export const getEligibleTreasurers = async (schoolId?: number): Promise<User[]> => {
  const params = schoolId ? { school_id: schoolId } : {};
  const response = await apiClient.get<User[]>('/eschools/users/treasurers', { params });
  console.log(`THIS IS  ~ response:`, response)
  return response.data || [];
}