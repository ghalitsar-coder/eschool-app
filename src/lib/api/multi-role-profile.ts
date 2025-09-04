// multi-role-profile.ts - Enhanced Profile API with Multi-Role Support
import { ApiResponse } from "@/types/api"
import apiClient from "./client"

// Types for multi-role profile
interface User {
  id: number
  name: string
  email: string
  base_role: string
  is_system_admin: boolean
}

interface KasSummary {
  total_balance?: number
  monthly_target?: number
  collection_rate?: number
  pending_approvals?: number
  personal_balance?: number
  payment_status?: 'up_to_date' | 'overdue' | 'partial'
}

interface AttendanceSummary {
  total_meetings: number
  attended: number
  attendance_rate: number
}

interface EschoolRole {
  eschool_id: number
  eschool_name: string
  school_id: number
  role_in_eschool: string
  permissions: string[]
  assigned_at: string
  status: 'active' | 'inactive'
  kas_summary: KasSummary
  attendance_summary: AttendanceSummary
}

interface PerformanceMetrics {
  avg_attendance_rate: number
  total_kas_managed: number
  total_personal_kas: number
  overall_activity_score: number
}

interface OverallSummary {
  total_eschools: number
  roles: {
    koordinator: number
    bendahara: number
    member: number
  }
  performance: PerformanceMetrics
}

interface RecentActivity {
  type: 'kas_transaction' | 'attendance' | 'role_assignment'
  eschool_name: string
  description: string
  amount?: number
  date: string
  role_context: string
}

interface MultiRoleProfileData {
  user: User
  eschool_roles: EschoolRole[]
  overall_summary: OverallSummary
  recent_activities: RecentActivity[]
}

// Define a type for the raw API response (what the backend actually returns)
type RawMultiRoleProfileData = MultiRoleProfileData;

export const multiRoleProfileApi = {
  // Get multi-role profile data
  getProfile: async (): Promise<ApiResponse<MultiRoleProfileData>> => {
    try {
      const response = await apiClient.get<RawMultiRoleProfileData>('/profile/multi-role')
      console.log(`🚀 ~ multi-role-profile.ts:79 ~ response:`, response)

      // The backend returns data directly, not wrapped in ApiResponse
      // So we need to wrap it in the expected structure
      return {
        success: true,
        message: "Profile data retrieved successfully",
        data: response.data
      }
    } catch (error) {
      console.error("Error fetching multi-role profile:", error)
      throw error
    }
  },

  // Update profile information
  updateProfile: async (data: {
    name?: string
    email?: string
    phone?: string
    address?: string
  }): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.put('/profile/update', data)
      return response.data
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  },

  // Change password
  changePassword: async (data: {
    current_password: string
    new_password: string
    new_password_confirmation: string
  }): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.put('/profile/change-password', data)
      return response.data
    } catch (error) {
      console.error("Error changing password:", error)
      throw error
    }
  },
}

export default multiRoleProfileApi
