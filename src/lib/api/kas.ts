// kasApi.ts - Kas Management API based on Laravel backend
import { ApiResponse, KasRecord, Member, KasSummary, KasPayment } from "@/types/api";
import apiClient from "./client";

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
    data: KasIncomeData
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

export default kasApi;
