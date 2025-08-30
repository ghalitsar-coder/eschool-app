// attendanceApi.ts - Attendance Management API based on Laravel backend
import { 
  ApiResponse, 
  AttendanceFormData, 
  AttendanceRecord, 
  AttendanceStats 
} from "@/types/api";
import apiClient from "./client";

export const attendanceApi = {
  // Record attendance
  recordAttendance: async (
    data: AttendanceFormData
  ): Promise<ApiResponse<AttendanceRecord>> => {
    try {
      // Log the data being sent for debugging
      console.log("Sending attendance data:", data);
      
      const formattedData = {
        ...data,
        members: data.members.map(member => ({
          ...member,
          is_present: Boolean(member.is_present), // Ensure boolean type
          member_id: Number(member.member_id) // Ensure number type
        }))
      };
      
      // Log the formatted data
      console.log("Formatted attendance data:", formattedData);
      
      const response = await apiClient.post("/attendance/record", formattedData);
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
  }): Promise<AttendanceRecord[]> => {
    try {
      // Convert camelCase keys to snake_case to match backend expectations
      const convertedParams = params ? {
        eschool_id: params.eschoolId,
        date: params.date,
        start_date: params.start_date,
        end_date: params.end_date,
      } : {};
      
      const response = await apiClient.get("/attendance/records", { 
        params: convertedParams 
      });
      return Array.isArray(response.data.data) ? response.data.data : [];
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

  // Get members for attendance
  getAttendanceMembers: async (eschoolId: number): Promise<any[]> => {
    try {
      // This would need to be implemented in the backend
      // For now, we'll use the members endpoint
      const response = await apiClient.get(`/members`, {
        params: { eschool_id: eschoolId }
      });
      console.log(`🚀 ~ attendance.ts:71 ~ response:`, response)

      return response.data.data || [];
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
    format?: "csv" | "excel";
  }): Promise<Blob> => {
    try {
      const response = await apiClient.get("/attendance/export", {
        params,
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