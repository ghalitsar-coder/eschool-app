import apiClient from "./client";

// Types for dashboard API
interface AttendanceStatistics {
  today: {
    present: number;
    total: number;
    percentage: number;
  };
  week: {
    present: number;
    total: number;
    percentage: number;
  };
  month: {
    present: number;
    total: number;
    percentage: number;
  };
  total_members: number;
}

interface AttendanceAnalytics {
  overall: {
    total_members: number;
    total_present: number;
    total_possible: number;
    attendance_rate: number;
  };
  daily_summary: Array<{
    date: string;
    formatted_date: string;
    present: number;
    absent: number;
    total: number;
  }>;
  member_attendance: Array<{
    name: string;
    attendance_rate: number;
    present: number;
    total: number;
  }>;
  weekday_analysis: Array<{
    day_of_week: string;
    short_day: string;
    average_attendance_rate: number;
  }>;
}

interface KasSummary {
  eschool: {
    name: string;
    monthly_kas_amount: number;
  };
  summary: {
    total_income: number;
    total_expense: number;
    balance: number;
    total_members: number;
  };
  current_month: {
    month: number;
    year: number;
    paid_count: number;
    unpaid_count: number;
    payment_percentage: number;
  };
}

// StaffOverview interface removed - now uses MultiRoleProfileData

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class DashboardApi {
  /**
   * Get attendance statistics for coordinator dashboard
   */
  async getAttendanceStatistics(): Promise<ApiResponse<AttendanceStatistics>> {
    try {
      const response = await apiClient.get("/dashboard/attendance/statistics");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching attendance statistics:", error);
      throw error;
    }
  }

  /**
   * Get attendance analytics for coordinator dashboard
   */
  async getAttendanceAnalytics(params?: {
    period?: string;
  }): Promise<ApiResponse<AttendanceAnalytics>> {
    try {
      const response = await apiClient.get("/dashboard/attendance/analytics", {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching attendance analytics:", error);
      throw error;
    }
  }

  /**
   * Get kas summary for bendahara dashboard
   */
  async getKasSummary(): Promise<ApiResponse<KasSummary>> {
    try {
      const response = await apiClient.get("/dashboard/kas/summary");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching kas summary:", error);
      throw error;
    }
  }

  // Staff overview now handled by multi-role-profile API
}

// Export singleton instance
const dashboardApi = new DashboardApi();
export default dashboardApi;

// Export types
export type {
  AttendanceStatistics,
  AttendanceAnalytics,
  KasSummary,
  ApiResponse,
};
