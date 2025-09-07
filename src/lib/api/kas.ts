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
    monthly_fee_amount: number;
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
      // Transform frontend data to match backend expectations
      const transformedData = {
        eschool_id: 1, // This should come from the user's eschool context
        description: data.description,
        date: data.date,
        payments: data.payments.map(payment => ({
          member_id: parseInt(payment.member_id),
          amount: parseFloat(payment.amount),
          month: parseInt(payment.month),
          year: parseInt(payment.year)
        }))
      };

      const response = await apiClient.post("/kas/income", transformedData);
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
      const response = await apiClient.post("/kas/records", {
        ...data,
        eschool_id: 1, // This should come from the user's eschool context
      });
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
    eschoolId:number;
  }): Promise<any> => {
    
    // alert("helo")
    const {eschoolId,...payload} = params
    try {
      // For now, we'll use a fixed eschool_id. In real implementation, this should come from user context.
      const response = await apiClient.get(`/kas/records/${eschoolId}`, { params:payload });

      // Transform backend response to match frontend expectations
      const transformedData = {
        data: response.data.data.kas_records.map((record: any) => ({
          id: record.id,
          type: parseFloat(record.amount.toString()) > 0 ? "income" : "expense",
          amount: Math.abs(parseFloat(record.amount.toString())),
          description: record.description,
          category: record.category,
          date: record.date,
          created_at: record.created_at,
          updated_at: record.updated_at,
          recorder: record.recorder,
          payments: record.kas_payments ? record.kas_payments.map((payment: any) => ({
            id: payment.id,
            member_name: payment.member?.user?.profile?.name || "Unknown Member",
            amount: parseFloat(payment.amount.toString()),
            month: parseInt(payment.month),
            year: parseInt(payment.year)
          })) : []
        })),
        pagination: response.data.pagination || {
          current_page: 1,
          last_page: 1,
          per_page: response.data.data.kas_records.length,
          total: response.data.data.kas_records.length,
          from: 1,
          to: response.data.data.kas_records.length
        }
      };

      return transformedData;
    } catch (error) {
      console.error("Error fetching kas records:", error);
      throw error;
    }
  },

  // Get kas summary for dashboard
  getSummary: async (): Promise<any> => {
    try {
      // For now, we'll use a fixed eschool_id. In real implementation, this should come from user context.
      const response = await apiClient.get(`/kas/payments/summary/1`);

      // Transform backend response to match frontend expectations
      const transformedData = {
        eschool: {
          name: response.data.data.eschool.name,
          monthly_kas_amount: parseFloat(response.data.data.eschool.monthly_fee_amount.toString())
        },
        summary: {
          total_income: parseFloat(response.data.data.summary.total_income.toString()),
          total_expense: parseFloat(response.data.data.summary.total_expense.toString()),
          balance: parseFloat(response.data.data.summary.balance.toString()),
          total_members: parseInt(response.data.data.summary.total_members.toString())
        },
        current_month: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          paid_count: parseInt(response.data.data.summary.paid_members.toString()),
          unpaid_count: parseInt(response.data.data.summary.unpaid_members.toString()),
          payment_percentage: parseFloat(response.data.data.summary.payment_percentage.toString())
        }
      };

      return transformedData;
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
    eschoolId?: number; // Add eschoolId parameter
  }): Promise<Blob> => {
    try {
      // Make sure eschoolId is provided
      if (!params.eschoolId) {
        throw new Error("Eschool ID is required for export");
      }

      // For CSV export
      const response = await apiClient.get(`/kas/export/${params.eschoolId}`, {
        params: {
          type: params.type,
          date_from: params.date_from,
          date_to: params.date_to
        },
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
