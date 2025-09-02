// attendanceApi.ts - Attendance Management API based on Laravel backend
import { 
  ApiResponse, 
  AttendanceFormData, 
  AttendanceRecord, 
  AttendanceStats,
  AttendanceAnalytics
} from "@/types/api";
import apiClient from "./client";

export const attendanceApi = {
  // Record attendance
  recordAttendance: async (
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
        const formattedData = {
          ...data,
          members: data.members.map(member => ({
            ...member,
            is_present: Boolean(member.is_present), // Ensure boolean type
            member_id: Number(member.member_id) // Ensure number type
          }))
        };
        
        requestData = formattedData;
        headers = {
          'Content-Type': 'application/json',
        };
        console.log("Formatted attendance data:", formattedData);
      }
      
      const response = await apiClient.post<ApiResponse<AttendanceRecord>>(
        `/attendance/record`,
        requestData,
        { headers }
      );
      
      return response.data;
    } catch (error: any) {
      console.error("Error recording attendance:", error);
      
      // Log more detailed error information
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("Request data:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      
      throw error;
    }
  },

  // Get attendance records
  getAttendanceRecords: async (params?: {
    eschoolId?: number;
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
      // Convert camelCase keys to snake_case to match backend expectations
      const convertedParams = params ? {
        eschool_id: params.eschoolId,
        date: params.date,
        start_date: params.start_date,
        end_date: params.end_date,
        search: params.search,
        member_id: params.member_id,
        is_present: params.is_present,
        page: params.page,
        per_page: params.per_page || 10, // Default 10 per page
      } : {};
      
      // Remove undefined values to avoid sending empty parameters
      const cleanParams = Object.fromEntries(
        Object.entries(convertedParams).filter(([, value]) => value !== undefined)
      );
      
      const response = await apiClient.get("/attendance/records", { 
        params: cleanParams 
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

  // Get attendance statistics
  getAttendanceStatistics: async (eschoolId: number): Promise<AttendanceStats> => {
    try {
      const response = await apiClient.get("/attendance/statistics", {
        params: { eschool_id: eschoolId }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching attendance statistics:", error);
      throw error;
    }
  },

  // Get attendance analytics
  getAttendanceAnalytics: async (params: {
    eschoolId: number;
    period?: string;
  }): Promise<AttendanceAnalytics> => {
    try {
      const response = await apiClient.get("/attendance/analytics", {
        params: { 
          eschool_id: params.eschoolId,
          period: params.period
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching attendance analytics:", error);
      throw error;
    }
  },

  // Get members for attendance
  getAttendanceMembers: async (eschoolId: number): Promise<any[]> => {
    try {
      // Use the members endpoint with eschool_id parameter
      const response = await apiClient.get(`/members`, {
        params: { eschool_id: eschoolId }
      });
      console.log(`🚀 ~ attendance.ts:71 ~ response:`, response)

      // If response has data property (paginated), return data
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // If response is directly an array, return it
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching attendance members:", error);
      throw error;
    }
  },

  // Update attendance record
  updateAttendance: async (
    id: number,
    data: any
  ): Promise<ApiResponse<AttendanceRecord>> => {
    try {
      const response = await apiClient.put(`/attendance/records/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating attendance:", error);
      throw error;
    }
  },

  // Delete attendance record
  deleteAttendance: async (id: number): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/attendance/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting attendance:", error);
      throw error;
    }
  },

  // Export attendance records
  exportRecords: async (params: {
    eschool_id: number;
    start_date?: string;
    end_date?: string;
    format?: "csv" | "pdf";
  }): Promise<Blob> => {
    try {
      // Use the correct endpoint based on format
      const endpoint = params.format === "pdf" ? "/attendance/export/pdf" : "/attendance/export/csv";
      
      const response = await apiClient.get(endpoint, {
        params: {
          eschool_id: params.eschool_id,
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