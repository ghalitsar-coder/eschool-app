// kasApi.ts - Kas Management API based on Laravel backend
import { ApiResponse,   AttendanceFormData,   AttendanceRecord, AttendanceStats, CreateAttendanceParams } from "@/types/api";
import apiClient from "./client";

 

export const attendanceApi = {
  // Get members for current treasurer's eschool
  

  // Add income record with payments
  recordAttendance: async (
    data: AttendanceFormData
  ): Promise<ApiResponse<AttendanceRecord>> => {
    try {
      const response = await apiClient.post("/attendance/record", data);
      return response.data;
    } catch (error) {
      console.error("Error adding income:", error);
      throw error;
    }
  },
 

  // Get kas records history with pagination and filters
  getAttendanceRecords: async (params?: {
    eschoolId?: number;
    date?: Date;
    start_date?: Date;
    page?: Date;
  }): Promise<AttendanceRecord[]> => {
    try {
      const response = await apiClient.get("/attendance/records", {params:{ eschool_id:params?.eschoolId }});
      console.log(`🚀 ~ attendance.ts:34 ~ response:`, response)

      
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error("Error fetching kas records:", error);
      throw error;
    }
  },

  // Get kas summary for dashboard
  getAttendanceStatistics: async (eschoolId?:number): Promise<AttendanceStats> => {
    

    try {
      const response = await apiClient.get("/attendance/statistics", {
        params:{
          eschool_id:Number(eschoolId)
        }
      });
      
      // Convert string numbers to actual numbers for consistency
      const data = response.data;
      return data;
    } catch (error) {
      console.error("Error fetching kas summary:", error);
      throw error;
    }
  },

  // Export kas records (if implemented in backend)
  exportRecords: async (params: {
    type?: "income" | "expense";
    month?: number;
    year?: number;
    format?: "csv" | "excel";
  }): Promise<Blob> => {
    try {
      const response = await apiClient.get("/kas/export", {
        params,
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Error exporting kas records:", error);
      throw error;
    }
  },
};

export default attendanceApi;
