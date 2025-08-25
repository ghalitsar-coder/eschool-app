// useKasManagement.ts - Kas management with TanStack Query based on Laravel backend
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KasSummary } from "../types/api";
import { useAuth } from "./use-auth";
import {
  kasApi,
  KasIncomeData,
  KasExpenseData,
  MembersResponse,
  KasRecordsResponse,
} from "@/lib/api/kas";

// Query keys for better cache management
export const kasQueryKeys = {
  records: ["kas", "records"] as const,
  summary: ["kas", "summary"] as const,
  members: ["kas", "members"] as const,
};

export const useKasRecords = (params?: {
  type?: "income" | "expense";
  month?: number;
  year?: number;
  page?: number;
}) => {
  const { isBendahara, isKoordinator, isStaff, user, isAuthenticated } =
    useAuth();
  const canAccessKas = isBendahara || isKoordinator || isStaff;

  // Debug logging
  // console.log("useKasRecords - User:", user);
  // console.log("useKasRecords - isAuthenticated:", isAuthenticated);
  // console.log("useKasRecords - isBendahara:", isBendahara);
  // console.log("useKasRecords - canAccessKas:", canAccessKas);

  return useQuery({
    queryKey: [...kasQueryKeys.records, params],
    queryFn: async () => {
      const response = await kasApi.getKasRecords(params);
      return response;
    },
    enabled: isAuthenticated && canAccessKas,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useKasSummary = () => {
  const { isBendahara, isKoordinator, isStaff, user, isAuthenticated } =
    useAuth();
  const canAccessKas = isBendahara || isKoordinator || isStaff;

  // Debug logging
  // console.log("useKasSummary - User:", user);
  // console.log("useKasSummary - isAuthenticated:", isAuthenticated);
  // console.log("useKasSummary - isBendahara:", isBendahara);
  // console.log("useKasSummary - canAccessKas:", canAccessKas);

  return useQuery({
    queryKey: kasQueryKeys.summary,
    queryFn: async () => {
      const response = await kasApi.getSummary();
      return response;
    },
    enabled: isAuthenticated && canAccessKas,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useMembers = () => {
  const { isBendahara, isKoordinator, isStaff, user, isAuthenticated } =
    useAuth();
  const canAccessMembers = isBendahara || isKoordinator || isStaff;

  // Debug logging
  // console.log("useMembers - User:", user);
  // console.log("useMembers - isAuthenticated:", isAuthenticated);
  // console.log("useMembers - isBendahara:", isBendahara);
  // console.log("useMembers - canAccessMembers:", canAccessMembers);

  return useQuery({
    queryKey: kasQueryKeys.members,
    queryFn: async () => {
      const response = await kasApi.getMembers();
      return response;
    },
    enabled: isAuthenticated && canAccessMembers,
    staleTime: 10 * 60 * 1000, // 10 minutes (members don't change often)
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useAddIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: KasIncomeData) => {
      const response = await kasApi.addIncome(data);
      return response;
    },
    onSuccess: (data) => {
      // Invalidate and refetch kas-related queries
      queryClient.invalidateQueries({ queryKey: kasQueryKeys.records });
      queryClient.invalidateQueries({ queryKey: kasQueryKeys.summary });
      // console.log("Income added successfully:", data);
    },
    onError: (error: any) => {
      console.error(
        "Failed to add income:",
        error?.response?.data?.message || error.message
      );
    },
  });
};

export const useAddExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: KasExpenseData) => {
      const response = await kasApi.addExpense(data);
      return response;
    },
    onSuccess: (data) => {
      // Invalidate and refetch kas-related queries
      queryClient.invalidateQueries({ queryKey: kasQueryKeys.records });
      queryClient.invalidateQueries({ queryKey: kasQueryKeys.summary });
      console.log("Expense added successfully:", data);
    },
    onError: (error: any) => {
      console.error(
        "Failed to add expense:",
        error?.response?.data?.message || error.message
      );
    },
  });
};

export const useExportKasRecords = () => {
  return useMutation({
    mutationFn: async (params: {
      type?: "income" | "expense";
      month?: number;
      year?: number;
      format?: "csv" | "excel";
    }) => {
      const blob = await kasApi.exportRecords(params);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `kas-records-${new Date().toISOString().split("T")[0]}.${
        params.format || "csv"
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return blob;
    },
    onSuccess: () => {
      console.log("Kas records exported successfully");
    },
    onError: (error: unknown) => {
      console.error(
        "Failed to export kas records:",
        error?.response?.data?.message || error.message
      );
    },
  });
};

// Main hook that combines all kas management functionality
export const useKasManagement = () => {
  const recordsQuery = useKasRecords();
  const summaryQuery = useKasSummary();
  const membersQuery = useMembers();
  const addIncomeMutation = useAddIncome();
  const addExpenseMutation = useAddExpense();
  const exportRecordsMutation = useExportKasRecords();

  return {
    // Queries data
    records: recordsQuery.data?.data || [],
    pagination: recordsQuery.data?.pagination,
    summary: summaryQuery.data || {
      eschool: { name: "", monthly_kas_amount: 0 },
      summary: {
        total_income: 0,
        total_expense: 0,
        balance: 0,
        total_members: 0,
      },
      current_month: {
        month: 0,
        year: 0,
        paid_count: 0,
        unpaid_count: 0,
        payment_percentage: 0,
      },
    },
    members: membersQuery.data?.members || [],
    eschool: membersQuery.data?.eschool,

    // Loading states
    isLoadingRecords: recordsQuery.isLoading,
    isLoadingSummary: summaryQuery.isLoading,
    isLoadingMembers: membersQuery.isLoading,
    isAddingIncome: addIncomeMutation.isPending,
    isAddingExpense: addExpenseMutation.isPending,
    isExporting: exportRecordsMutation.isPending,

    // Error states
    recordsError: recordsQuery.error,
    summaryError: summaryQuery.error,
    membersError: membersQuery.error,
    addIncomeError: addIncomeMutation.error,
    addExpenseError: addExpenseMutation.error,
    exportError: exportRecordsMutation.error,

    // Actions
    addIncome: addIncomeMutation.mutate,
    addExpense: addExpenseMutation.mutate,
    exportRecords: exportRecordsMutation.mutate,

    // Refetch functions
    refetchRecords: recordsQuery.refetch,
    refetchSummary: summaryQuery.refetch,
    refetchMembers: membersQuery.refetch,

    // Query objects for advanced usage
    recordsQuery,
    summaryQuery,
    membersQuery,
    addIncomeMutation,
    addExpenseMutation,
    exportRecordsMutation,
  };
};
