// member-management.ts - Enhanced Member Management API with Multi-Role Support
import { ApiResponse } from "@/types/api";
import apiClient from "./client";

// Types for enhanced member management
interface AssignRolePayload {
  user_id: number;
  role: 'koordinator' | 'bendahara' | 'member';
  member_details?: {
    nip?: string;
    student_id?: string;
    date_of_birth?: string;
    gender?: 'L' | 'P';
    address?: string;
    phone?: string;
  };
  create_user_if_not_exists?: boolean;
}

interface CreateUserPayload {
  user_data: {
    name: string;
    email: string;
    password?: string;
    base_role: 'siswa' | 'guru' | 'staff';
  };
}
interface EnhancedMember {
  user_id: number;
  name: string;
  email: string;
  student_id?: string;
  phone?: string;
  role_in_eschool: string;
  permissions: string[];
  status: 'active' | 'inactive';
  assigned_at: string;
  member_details?: {
    gender?: string;
    address?: string;
    date_of_birth?: string;
  };
  other_roles?: Array<{
    eschool_id: number;
    eschool_name: string;
    role: string;
  }>;
  attendance_summary?: {
    total_sessions: number;
    attended: number;
    attendance_rate: number;
  };
}

interface AvailableUser {
  id: number;
  name: string;
  email: string;
  base_role: string;
  current_eschool_roles: Array<{
    eschool_id: number;
    eschool_name: string;
    role: string;
  }>;
  available_roles: string[];
  qwen_compliant: boolean;
  can_assign_koordinator: boolean;
}

interface RoleSummary {
  koordinator: number;
  bendahara: number;
  member: number;
}

interface MemberManagementResponse {
  success: boolean;
  data: EnhancedMember[];
  role_summary: RoleSummary;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const memberManagementApi = {
  // Get members for management (koordinator access)
  getMembers: async (params: {
    eschoolId: number;
    page?: number;
    per_page?: number;
    search?: string;
    role_filter?: string;
  }): Promise<MemberManagementResponse> => {
    try {
      const cleanParams = {
        page: params.page || 1,
        per_page: params.per_page || 15,
        search: params.search,
        role_filter: params.role_filter || 'all',
      };
      
      // Remove undefined values
      const filteredParams = Object.fromEntries(
        Object.entries(cleanParams).filter(([, value]) => value !== undefined && value !== '')
      );
      
      const response = await apiClient.get(
        `/eschool/${params.eschoolId}/members/manage`,
        { params: filteredParams }
      );
      
      return response.data;
    } catch (error) {
      console.error("Error fetching members for management:", error);
      throw error;
    }
  },

  // Get available users for eschool assignment
  getAvailableUsers: async (eschoolId: number): Promise<ApiResponse<AvailableUser[]>> => {
    try {
      const response = await apiClient.get(`/users/available-for-eschool/${eschoolId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching available users:", error);
      throw error;
    }
  },

  // Assign role to user in eschool
  assignRole: async (
    eschoolId: number,
    data: AssignRolePayload
  ): Promise<ApiResponse<EnhancedMember>> => {
    try {
      const response = await apiClient.post(
        `/eschool/${eschoolId}/members/assign-role`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error assigning role:", error);
      throw error;
    }
  },

  // Update role for user in eschool
  updateRole: async (
    eschoolId: number,
    userId: number,
    data: Partial<AssignRolePayload>
  ): Promise<ApiResponse<EnhancedMember>> => {
    try {
      const response = await apiClient.put(
        `/eschool/${eschoolId}/members/${userId}/update-role`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  },

  // Remove role from user in eschool
  removeRole: async (
    eschoolId: number,
    userId: number
  ): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(
        `/eschool/${eschoolId}/members/${userId}/remove-role`
      );
      return response.data;
    } catch (error) {
      console.error("Error removing role:", error);
      throw error;
    }
  },

  // Create new user and assign role (if needed)
  createUserAndAssignRole: async (
    eschoolId: number,
    data: CreateUserPayload & AssignRolePayload
  ): Promise<ApiResponse<EnhancedMember>> => {
    try {
      const payload = {
        ...data,
        create_user_if_not_exists: true
      };
      
      const response = await apiClient.post(
        `/eschool/${eschoolId}/members/assign-role`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error creating user and assigning role:", error);
      throw error;
    }
  },
};

export default memberManagementApi;
