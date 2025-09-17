import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import bendaharaDashboardApi from '@/lib/api/bendahara-dashboard';

// Types (re-exported from API)
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

// Hook to fetch bendahara dashboard data
export const useBendaharaDashboard = () => {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['bendahara-dashboard', user?.eschool_id],
    queryFn: async () => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await bendaharaDashboardApi.getDashboard(user.eschool_id);
      return response.data;
    },
    enabled: !!user?.eschool_id && user?.role === 'bendahara',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  return {
    dashboardData: data,
    isLoadingDashboard: isLoading,
    dashboardError: error || null,
    refetchDashboard: refetch,
  };
};

// Hook to record kas income
export const useRecordIncome = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (data: IncomePayload) => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await bendaharaDashboardApi.recordIncome(user.eschool_id, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['bendahara-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['kas-transactions'] });
    },
  });

  const recordIncome = async (data: IncomePayload): Promise<RecentTransaction> => {
    const result = await mutateAsync(data);
    if (!result) {
      throw new Error("Failed to record income");
    }
    return result;
  };

  return {
    recordIncome,
    isRecordingIncome: isPending,
    recordIncomeError: error || null,
  };
};

// Hook to record kas expense
export const useRecordExpense = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (data: ExpensePayload) => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await bendaharaDashboardApi.recordExpense(user.eschool_id, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['bendahara-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['kas-transactions'] });
    },
  });

  const recordExpense = async (data: ExpensePayload): Promise<RecentTransaction> => {
    const result = await mutateAsync(data);
    if (!result) {
      throw new Error("Failed to record expense");
    }
    return result;
  };

  return {
    recordExpense,
    isRecordingExpense: isPending,
    recordExpenseError: error || null,
  };
};

// Hook to get kas transactions
export const useKasTransactions = (filters?: TransactionFilter) => {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['kas-transactions', user?.eschool_id, filters],
    queryFn: async () => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await bendaharaDashboardApi.getTransactions(user.eschool_id, filters);
      return response;
    },
    enabled: !!user?.eschool_id,
  });

  return {
    transactions: data?.data,
    meta: data?.meta,
    isLoadingTransactions: isLoading,
    transactionsError: error || null,
    refetchTransactions: refetch,
  };
};

// Hook to approve transaction
export const useApproveTransaction = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (transactionId: number) => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await bendaharaDashboardApi.approveTransaction(user.eschool_id, transactionId);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['bendahara-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['kas-transactions'] });
    },
  });

  const approveTransaction = async (transactionId: number): Promise<RecentTransaction> => {
    const result = await mutateAsync(transactionId);
    if (!result) {
      throw new Error("Failed to approve transaction");
    }
    return result;
  };

  return {
    approveTransaction,
    isApprovingTransaction: isPending,
    approveTransactionError: error || null,
  };
};
