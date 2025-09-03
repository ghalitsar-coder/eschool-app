// attendanceApi.ts - Enhanced Attendance Management API with Multi-Role Support
import { 
  ApiResponse, 
  AttendanceFormData, 
  AttendanceRecord, 
  AttendanceStats,
  AttendanceAnalytics,
  AttendanceMember
} from "@/types/api";
import apiClient from "./client";

export const attendanceApi = {
  // Record attendance using new multi-role endpoint
  recordAttendance: async (
    eschoolId: number,
    data: FormData | AttendanceFormData
  ): Promise<ApiResponse<AttendanceRecord>> => {
    try {
      // Log the data being sent for debugging
      console.log("Sending attendance data:", data);
      
      let requestData = data;
      let headers = {};
      
      // If it's FormData, we need to handle boolean conversion on server side
      if (data instanceof FormData) {
        requestData = data;
        headers = {
          'Content-Type': 'multipart/form-data',
        };
        console.log("Sending FormData with is_present as 1/0:", data);
      } else {
        const formattedData: AttendanceFormData = {
          ...data,
          members: data.members.map(member => ({
            ...member,
            is_present: Boolean(member.is_present), // Ensure boolean type
            member_id: String(member.member_id) // Ensure string type for consistency
          }))
        };
        
        requestData = formattedData;
        headers = {
          'Content-Type': 'application/json',
        };
        console.log("Formatted attendance data:", formattedData);
      }
      
      const response = await apiClient.post<ApiResponse<AttendanceRecord>>(
        `/eschool/${eschoolId}/attendance/record`,
        requestData,
        { headers }
      );
      
      return response.data;
    } catch (error: unknown) {
      console.error("Error recording attendance:", error);
      
      // Log more detailed error information
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data: unknown; status: number; headers: unknown }; request?: unknown; message?: string };
        if (axiosError.response) {
          console.error("Response data:", axiosError.response.data);
          console.error("Response status:", axiosError.response.status);
          console.error("Response headers:", axiosError.response.headers);
        } else if (axiosError.request) {
          console.error("Request data:", axiosError.request);
        } else {
          console.error("Error message:", axiosError.message);
        }
      }
      
      throw error;
    }
  },

  // Get attendance records using new multi-role endpoint
  getAttendanceRecords: async (params?: {
    eschoolId: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    member_id?: number;
    is_present?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<{
    data: AttendanceRecord[];
    meta: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
      from: number;
      to: number;
      has_next_page: boolean;
      has_prev_page: boolean;
    };
  }> => {
    try {
      if (!params?.eschoolId) {
        throw new Error("Eschool ID is required");
      }

      // Convert camelCase keys to snake_case to match backend expectations
      const cleanParams = {
        date: params.date,
        start_date: params.start_date,
        end_date: params.end_date,
        search: params.search,
        member_id: params.member_id,
        is_present: params.is_present,
        page: params.page,
        per_page: params.per_page || 10, // Default 10 per page
      };
      
      // Remove undefined values to avoid sending empty parameters
      const filteredParams = Object.fromEntries(
        Object.entries(cleanParams).filter(([, value]) => value !== undefined)
      );
      
      const response = await apiClient.get(`/eschool/${params.eschoolId}/attendance/records`, { 
        params: filteredParams 
      });
      
      return {
        data: Array.isArray(response.data.data) ? response.data.data : [],
        meta: response.data.meta || {
          total: 0,
          per_page: 10,
          current_page: 1,
          last_page: 1,
          from: 0,
          to: 0,
          has_next_page: false,
          has_prev_page: false
        }
      };
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      throw error;
    }
  },

  // Get attendance statistics using new multi-role endpoint
  getAttendanceStatistics: async (eschoolId: number): Promise<AttendanceStats> => {
    try {
      const response = await apiClient.get(`/eschool/${eschoolId}/attendance/statistics`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching attendance statistics:", error);
      throw error;
    }
  },

  // Get attendance analytics using new multi-role endpoint
  getAttendanceAnalytics: async (params: {
    eschoolId: number;
    period?: string;
  }): Promise<AttendanceAnalytics> => {
    try {
      const response = await apiClient.get(`/eschool/${params.eschoolId}/attendance/analytics`, {
        params: { 
          period: params.period || 'week'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching attendance analytics:", error);
      throw error;
    }
  },

  // Get members for attendance using new multi-role endpoint
  getAttendanceMembers: async (eschoolId: number): Promise<AttendanceMember[]> => {
    try {
      // Use the new multi-role members list endpoint
      const response = await apiClient.get(`/eschool/${eschoolId}/members/list`);
      console.log(`🚀 ~ attendance.ts:71 ~ response:`, response)

      // Return the data array from the response
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching attendance members:", error);
      throw error;
    }
  },

  // Update attendance record using new multi-role endpoint
  updateAttendance: async (
    eschoolId: number,
    id: number,
    data: Partial<AttendanceFormData>
  ): Promise<ApiResponse<AttendanceRecord>> => {
    try {
      const response = await apiClient.put(`/eschool/${eschoolId}/attendance/records/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating attendance:", error);
      throw error;
    }
  },

  // Delete attendance record using new multi-role endpoint
  deleteAttendance: async (eschoolId: number, id: number): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/eschool/${eschoolId}/attendance/records/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting attendance:", error);
      throw error;
    }
  },

  // Export attendance records using new multi-role endpoint
  exportRecords: async (params: {
    eschool_id: number;
    start_date?: string;
    end_date?: string;
    format?: "csv" | "pdf";
  }): Promise<Blob> => {
    try {
      // Use the new multi-role export endpoint
      const endpoint = params.format === "pdf" 
        ? `/eschool/${params.eschool_id}/attendance/export/pdf`
        : `/eschool/${params.eschool_id}/attendance/export/csv`;
      
      const response = await apiClient.get(endpoint, {
        params: {
          start_date: params.start_date,
          end_date: params.end_date,
        },
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Error exporting attendance records:", error);
      throw error;
    }
  },
};

export default attendanceApi;