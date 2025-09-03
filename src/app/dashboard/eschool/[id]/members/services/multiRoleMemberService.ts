import apiClient from "@/lib/api/client";

// Types
interface UserEschoolRole {
  user_id: number;
  name: string;
  email: string;
  student_id: string;
  phone: string;
  role_in_eschool: string;
  permissions: string[];
  status: string;
  assigned_at: string;
  member_details: {
    gender: string | null;
    address: string | null;
    date_of_birth: string | null;
  };
  other_roles: Array<{
    eschool_id: number;
    eschool_name: string;
    role: string;
  }>;
  attendance_summary: {
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
  [key: string]: number;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  role_summary?: RoleSummary;
  pagination?: Pagination;
}

interface AssignRolePayload {
  user_id: number;
  role: string;
  member_details?: {
    student_id?: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;
    phone?: string;
  };
  create_user_if_not_exists?: boolean;
}

interface UpdateRolePayload {
  role: string;
}

// API functions for multi-role member management
export const multiRoleMemberApi = {
  // Get members for management with pagination and search
  getMembers: async (
    eschoolId: number,
    params?: {
      page?: number;
      per_page?: number;
      search?: string;
      role_filter?: string;
    }
  ) => {
    try {
      const response = await apiClient.get<ApiResponse<UserEschoolRole[]>>(
        `/eschool/${eschoolId}/members/manage`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

  // Get available users for assignment to this eschool
  getAvailableUsers: async (eschoolId: number) => {
    try {
      const response = await apiClient.get<ApiResponse<AvailableUser[]>>(
        `/eschool/${eschoolId}/users/available-for-eschool`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching available users:', error);
      throw error;
    }
  },

  // Assign role to user in this eschool
  assignRole: async (eschoolId: number, data: AssignRolePayload) => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        `/eschool/${eschoolId}/members/assign-role`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  },

  // Update user role in this eschool
  updateRole: async (eschoolId: number, userId: number, data: UpdateRolePayload) => {
    try {
      const response = await apiClient.put<ApiResponse<any>>(
        `/eschool/${eschoolId}/members/${userId}/update-role`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  },

  // Remove user role from this eschool
  removeRole: async (eschoolId: number, userId: number) => {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        `/eschool/${eschoolId}/members/${userId}/remove-role`
      );
      return response.data;
    } catch (error) {
      console.error('Error removing role:', error);
      throw error;
    }
  },
};

export default multiRoleMemberApi;