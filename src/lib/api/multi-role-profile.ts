import apiClient from "./client";

// Types for multi-role profile API
interface User {
  id: number;
  name: string;
  email: string;
  base_role: string;
  is_system_admin: boolean;
}

interface KasSummary {
  total_balance?: number;
  monthly_target?: number;
  collection_rate?: number;
  pending_approvals?: number;
  personal_balance?: number;
  payment_status?: "up_to_date" | "overdue" | "partial";
}

interface AttendanceSummary {
  total_meetings: number;
  attended: number;
  attendance_rate: number;
}

interface EschoolRole {
  eschool_id: number;
  eschool_name: string;
  school_id: number;
  role_in_eschool: string;
  permissions: string[];
  assigned_at: string;
  status: "active" | "inactive";
  kas_summary: KasSummary;
  attendance_summary: AttendanceSummary;
}

interface PerformanceMetrics {
  avg_attendance_rate: number;
  total_kas_managed: number;
  total_personal_kas: number;
  overall_activity_score: number;
}

interface OverallSummary {
  total_eschools: number;
  roles: {
    koordinator: number;
    bendahara: number;
    member: number;
  };
  performance: PerformanceMetrics;
}

interface RecentActivity {
  type: "kas_transaction" | "attendance" | "role_assignment";
  eschool_name: string;
  description: string;
  amount?: number;
  date: string;
  role_context: string;
}

export interface MultiRoleProfileData {
  user: User;
  eschool_roles: EschoolRole[];
  overall_summary: OverallSummary;
  recent_activities: RecentActivity[];
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class MultiRoleProfileApi {
  /**
   * Get multi-role profile data
   */
  async getProfile(): Promise<ApiResponse<MultiRoleProfileData>> {
    try {
      const response = await apiClient.get("/dashboard/multi-role-profile");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching multi-role profile:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.put("/profile", data);
      return response.data;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post("/change-password", data);
      return response.data;
    } catch (error: any) {
      console.error("Error changing password:", error);
      throw error;
    }
  }
}

// Export singleton instance
const multiRoleProfileApi = new MultiRoleProfileApi();
export default multiRoleProfileApi;

// Export types
export type {
  User,
  KasSummary,
  AttendanceSummary,
  EschoolRole,
  PerformanceMetrics,
  OverallSummary,
  RecentActivity,
  UpdateProfileData,
  ChangePasswordData,
  ApiResponse,
};
