// koordinator-dashboard.ts - Koordinator Dashboard API with Multi-Role Support
import { ApiResponse } from "@/types/api";
import apiClient from "./client";

// Types for koordinator dashboard
interface UserContext {
  id: number;
  name: string;
  role_in_eschool: string;
  permissions: string[];
}

interface EschoolInfo {
  id: number;
  name: string;
  description: string;
  school_id: number;
  monthly_kas_amount: number;
  schedule_days: string[];
  total_schedule_days: number;
}

interface Statistics {
  total_members: number;
  active_members: number;
  role_breakdown: {
    koordinator: number;
    bendahara: number;
    member: number;
  };
  attendance_rate: number;
  total_sessions: number;
  present_sessions: number;
  kas_collection_rate: number;
  total_kas_expected: number;
  total_kas_collected: number;
  outstanding_kas: number;
}

interface RecentAttendance {
  id: number;
  date: string;
  user_id: number;
  member_name: string;
  role_in_eschool: string;
  is_present: boolean;
  recorded_by: {
    id: number;
    name: string;
    role_in_eschool: string;
  };
}

interface RecentPayment {
  user_id: number;
  member_name: string;
  role_in_eschool: string;
  amount: number;
  paid_date: string;
  approved_by: string;
}

interface UserWithMultipleRoles {
  user_id: number;
  name: string;
  roles_in_school: Array<{
    eschool_id: number;
    role: string;
  }>;
}

interface MultiRoleInsights {
  users_with_multiple_roles: UserWithMultipleRoles[];
  cross_participation_rate: number;
}

interface RecentActivities {
  recent_attendance: RecentAttendance[];
  recent_payments: RecentPayment[];
}

interface KoordinatorDashboardData {
  user_context: UserContext;
  eschool: EschoolInfo;
  statistics: Statistics;
  recent_activities: RecentActivities;
  multi_role_insights: MultiRoleInsights;
}

export const koordinatorDashboardApi = {
  // Get koordinator dashboard data
  getDashboard: async (eschoolId: number): Promise<ApiResponse<KoordinatorDashboardData>> => {
    try {
      const response = await apiClient.get(`/eschool/${eschoolId}/koordinator/dashboard`);
      return response.data;
    } catch (error) {
      console.error("Error fetching koordinator dashboard:", error);
      throw error;
    }
  },
};

export default koordinatorDashboardApi;
