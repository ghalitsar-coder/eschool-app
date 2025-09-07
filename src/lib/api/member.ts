// memberApi.ts - Member management API based on Laravel backend
import apiClient from "./client";
import { ApiResponse, Member } from "@/types/api";

// API functions for member management
export const memberApi = {
  // Get members by eschool ID
  getMembersByEschool: async (eschoolId?: number): Promise<ApiResponse<{ 
    eschool: {
      id: number;
      name: string;
      monthly_fee_amount: number;
    };
    members: Member[];
  }>> => {
    try {
      const response = await apiClient.get(`/members/${eschoolId}`);
      
      // Transform the response to match the expected structure
      const transformedData = {
        success: response.data.success,
        message: response.data.message,
        data: {
          eschool: {
            id: response.data.eschool?.id || 1,
            name: response.data.eschool?.name || "",
            monthly_fee_amount: response.data.eschool?.monthly_fee_amount || 0
          },
          members: response.data.members?.map((member: any) => ({
            id: member.id,
            student_id: member.student_id || "",
            name: member.user?.profile?.name || member.name || member.user?.name || "Unknown Member",
            email: member.user?.email || member.email || "",
            phone: member.phone || ""
          })) || []
        }
      };
      
      return transformedData;
    } catch (error) {
      console.error(`Error fetching members for eschool ${eschoolId}:`, error);
      throw error;
    }
  },

  // Get member by ID
  getMemberByEschool: async (id: number): Promise<ApiResponse<Member>> => {
    try {
      const response = await apiClient.get<ApiResponse<Member>>(`/members/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching member ${id}:`, error);
      throw error;
    }
  },
};

export default memberApi;