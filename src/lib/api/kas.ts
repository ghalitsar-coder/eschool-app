// kasApi.ts - Kas Management API based on Laravel backend
import { ApiResponse, KasRecord, Member, KasSummary, KasPayment } from "@/types/api";
import apiClient from "./client";
import { IncomeFormData } from "@/types/page/kas";

export interface KasIncomeData {
  description: string;
  date: string;
  payments: {
    member_id: number;
    amount: number;
    month: number;
    year: number;
  }[];
}

export interface KasExpenseData {
  amount: number;
  description: string;
  category?: string;
  date: string;
}

export interface MembersResponse {
  eschool: {
    id: number;
    name: string;
    monthly_kas_amount: number;
  };
  members: {
    id: number;
    student_id: string;
    name: string;
    email: string;
    phone?: string;
  }[];
}

export interface KasRecordsResponse {
  data: {
    id: number;
    type: "income" | "expense";
    amount: number;
    description: string;
    category?: string;
    date: string;
    created_at: string;
    payments?: {
      member_name: string;
      amount: number;
      month: number;
      year: number;
    }[];
  }[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const kasApi = {
 

  // Add income record with payments
  addIncome: async (
    data: IncomeFormData
  ): Promise<ApiResponse<{ kas_record_id: number }>> => {
    try {
      const response = await apiClient.post("/kas/income", data);
      return response.data;
    } catch (error) {
      console.error("Error adding income:", error);
      throw error;
    }
  },

  // Add expense record
  addExpense: async (
    data: KasExpenseData
  ): Promise<ApiResponse<{ kas_record_id: number }>> => {
    try {
      const response = await apiClient.post("/kas/expense", data);
      return response.data;
    } catch (error) {
      console.error("Error adding expense:", error);
      throw error;
    }
  },

  // Update a kas record
  updateRecord: async (
    id: number,
    data: Partial<KasExpenseData>
  ): Promise<ApiResponse<KasRecord>> => {
    try {
      const response = await apiClient.put(`/kas/records/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating record:", error);
      throw error;
    }
  },

  // Get kas records history with pagination and filters
  getKasRecords: async (params?: {
    type?: "income" | "expense";
    month?: number;
    year?: number;
    page?: number;
  }): Promise<KasRecordsResponse> => {
    
    try {
      const response = await apiClient.get("/kas/records", { params });
      

      // Convert string amounts to numbers for consistency
      const data = response.data;
      if (data.data && Array.isArray(data.data)) {
        data.data = data.data.map((record: KasRecord) => ({
          ...record,
          amount: Number(record.amount) || 0,
          payments:
            record.payments?.map((payment: KasPayment) => ({
              ...payment,
              amount: Number(payment.amount) || 0,
            })) || [],
        }));
      }

      return data;
    } catch (error) {
      console.error("Error fetching kas records:", error);
      throw error;
    }
  },

  // Get kas summary for dashboard
  getSummary: async (): Promise<KasSummary> => {
    
    try {
      const response = await apiClient.get("/kas/summary");
      

      // Convert string numbers to actual numbers for consistency
      const data = response.data;
      if (data.summary) {
        data.summary.total_income = Number(data.summary.total_income) || 0;
        data.summary.total_expense = Number(data.summary.total_expense) || 0;
        data.summary.balance = Number(data.summary.balance) || 0;
        data.summary.total_members = Number(data.summary.total_members) || 0;
      }

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
    date_from?: string;
    date_to?: string;
  }): Promise<Blob> => {
    try {
      // For CSV export
      if (params.format === "csv") {
        const response = await apiClient.get("/kas/export/csv", {
          params: {
            type: params.type,
            month: params.month,
            year: params.year,
            date_from: params.date_from,
            date_to: params.date_to
          },
          responseType: "blob",
        });
        return response.data;
      }
      
      // For other formats, use the existing endpoint
      const response = await apiClient.get("/kas/export", {
        params,
        responseType: "blob",
      });
      return response.data;
    } catch (error: any) {
      console.error("Error exporting kas records:", error);
      
      // Handle specific error cases
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Unknown server error';
        throw new Error(`Export failed: ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Export failed: No response from server. Please check your connection.');
      } else {
        // Something else happened
        throw new Error(`Export failed: ${error.message}`);
      }
    }
  },
};

export default kasApi;
