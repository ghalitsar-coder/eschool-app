// bendahara-dashboard.ts - Bendahara Dashboard API with Multi-Role Support
import { ApiResponse } from "@/types/api";
import apiClient from "./client";

// Types for bendahara dashboard
interface UserContext {
  id: number;
  name: string;
  role_in_eschool: string;
  permissions: string[];
}

interface EschoolInfo {
  id: number;
  name: string;
  monthly_kas_amount: number;
}

interface KasSummary {
  current_balance: number;
  total_income: number;
  total_expense: number;
  monthly_target: number;
  collection_rate: number;
  pending_approvals: number;
  outstanding_amount: number;
}

interface MemberKasStatus {
  current_balance: number;
  monthly_target: number;
  last_payment: string;
  payment_status: 'up_to_date' | 'overdue' | 'partial';
  outstanding: number;
}

interface MemberListItem {
  user_id: number;
  name: string;
  role_in_eschool: string;
  student_id: string;
  email: string;
  phone: string;
  kas_status: MemberKasStatus;
}

interface RecentTransaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  recorded_by: {
    id: number;
    name: string;
    role_in_eschool: string;
  };
  approved_by: {
    id: number;
    name: string;
    role_in_eschool: string;
  } | null;
  status: 'pending_approval' | 'approved' | 'rejected';
}

interface MonthlyBreakdown {
  month: number;
  year: number;
  target: number;
  collected: number;
  rate: number;
  outstanding_members: number;
}

interface BendaharaDashboardData {
  user_context: UserContext;
  eschool: EschoolInfo;
  kas_summary: KasSummary;
  member_list: MemberListItem[];
  recent_transactions: RecentTransaction[];
  monthly_breakdown: MonthlyBreakdown[];
}

// Types for kas management
interface PaymentItem {
  user_id: string;
  amount: string;
  month: string;
  year: string;
  notes?: string;
}

interface IncomePayload {
  description: string;
  date: string;
  payments: PaymentItem[];
  requires_approval?: boolean;
  auto_approve?: boolean;
}

interface ExpensePayload {
  amount: number;
  description: string;
  category: string;
  date: string;
  receipt_document?: File;
  requires_approval?: boolean;
  approved_by_koordinator?: boolean;
}

interface TransactionFilter {
  page?: number;
  type?: 'all' | 'income' | 'expense';
  status?: 'all' | 'pending' | 'approved' | 'rejected';
  start_date?: string;
  end_date?: string;
}

export const bendaharaDashboardApi = {
  // Get bendahara dashboard data
  getDashboard: async (eschoolId: number): Promise<ApiResponse<BendaharaDashboardData>> => {
    try {
      const response = await apiClient.get(`/eschool/${eschoolId}/bendahara/kas-dashboard`);
      return response.data;
    } catch (error) {
      console.error("Error fetching bendahara dashboard:", error);
      throw error;
    }
  },

  // Record kas income
  recordIncome: async (
    eschoolId: number,
    data: IncomePayload
  ): Promise<ApiResponse<RecentTransaction>> => {
    try {
      const response = await apiClient.post(`/eschool/${eschoolId}/kas/income`, data);
      return response.data;
    } catch (error) {
      console.error("Error recording income:", error);
      throw error;
    }
  },

  // Record kas expense
  recordExpense: async (
    eschoolId: number,
    data: ExpensePayload
  ): Promise<ApiResponse<RecentTransaction>> => {
    try {
      const formData = new FormData();
      
      formData.append('amount', data.amount.toString());
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('date', data.date);
      
      if (data.receipt_document) {
        formData.append('receipt_document', data.receipt_document);
      }
      
      if (data.requires_approval !== undefined) {
        formData.append('requires_approval', data.requires_approval.toString());
      }
      
      if (data.approved_by_koordinator !== undefined) {
        formData.append('approved_by_koordinator', data.approved_by_koordinator.toString());
      }

      const response = await apiClient.post(
        `/eschool/${eschoolId}/kas/expense`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error recording expense:", error);
      throw error;
    }
  },

  // Get transactions with filters
  getTransactions: async (
    eschoolId: number,
    filters?: TransactionFilter
  ): Promise<{
    data: RecentTransaction[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> => {
    try {
      const cleanParams = {
        page: filters?.page || 1,
        type: filters?.type || 'all',
        status: filters?.status || 'all',
        start_date: filters?.start_date,
        end_date: filters?.end_date,
      };
      
      // Remove undefined values
      const filteredParams = Object.fromEntries(
        Object.entries(cleanParams).filter(([, value]) => value !== undefined && value !== '')
      );
      
      const response = await apiClient.get(
        `/eschool/${eschoolId}/kas/transactions`,
        { params: filteredParams }
      );
      
      return response.data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },

  // Approve transaction
  approveTransaction: async (
    eschoolId: number,
    transactionId: number
  ): Promise<ApiResponse<RecentTransaction>> => {
    try {
      const response = await apiClient.put(
        `/eschool/${eschoolId}/kas/transactions/${transactionId}/approve`
      );
      return response.data;
    } catch (error) {
      console.error("Error approving transaction:", error);
      throw error;
    }
  },
};

export default bendaharaDashboardApi;
