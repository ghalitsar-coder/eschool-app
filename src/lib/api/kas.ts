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
  // Get members for current treasurer's eschool
  getMembers: async (): Promise<MembersResponse> => {
    console.log("🚀 getMembers API called!");
    try {
      const response = await apiClient.get("/members");

      // Handle both mock data and real data
      if (response.data.eschool && response.data.members) {
        return response.data;
      }

      // Handle the "hello world" response from backend (fallback)
      if (response.data.message === "hello world") {
        // Return mock data that matches the expected structure
        return {
          eschool: {
            id: 1,
            name: "Kelas XII IPA 1", // Match with summary data
            monthly_kas_amount: 25000, // Match with summary data
          },
          members: [
            {
              id: 1,
              student_id: "12345",
              name: "Andi Pratama",
              email: "andi@example.com",
              phone: "081234567890",
            },
            {
              id: 2,
              student_id: "12346",
              name: "Sari Indah",
              email: "sari@example.com",
              phone: "081234567891",
            },
            {
              id: 3,
              student_id: "12347",
              name: "Rudi Hermawan",
              email: "rudi@example.com",
              phone: "081234567892",
            },
            {
              id: 4,
              student_id: "12348",
              name: "Maya Sari",
              email: "maya@example.com",
              phone: "081234567893",
            },
            {
              id: 5,
              student_id: "12349",
              name: "Doni Setiawan",
              email: "doni@example.com",
              phone: "081234567894",
            },
            {
              id: 6,
              student_id: "12350",
              name: "Lina Marlina",
              email: "lina@example.com",
              phone: "081234567895",
            },
          ],
        };
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching members:", error);
      throw error;
    }
  },

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
    console.log("🚀 getKasRecords API called!");
    try {
      const response = await apiClient.get("/kas/records", { params });
      console.log("Kas records API response:", response.data);

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
    console.log("🚀 getSummary API called!");
    try {
      const response = await apiClient.get("/kas/summary");
      console.log("Kas summary API response:", response.data);

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
