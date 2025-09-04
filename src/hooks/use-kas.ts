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
import { MembersApiResponse } from "@/lib/api/members";
import { IncomeFormData } from "@/types/page/kas";
import memberApi from "@/lib/api/member";

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

  return useQuery({
    queryKey: [...kasQueryKeys.records, params],
    queryFn: async () => {
      const response = await kasApi.getKasRecords(params);
      return response;
    },
    enabled: true,
  });
};

export const useKasSummary = () => {
  const { isBendahara, isKoordinator, isStaff, user, isAuthenticated } =
    useAuth();

  return useQuery({
    queryKey: kasQueryKeys.summary,
    queryFn: async () => {
      const response = await kasApi.getSummary();
      return response;
    },
    enabled: true,
  });
};

export const useMembers = () => {
  const { user, isAuthenticated } = useAuth();
  console.log(`🚀 ~ use-kas.ts:58 ~ user:`, user)


  return useQuery({
    queryKey: kasQueryKeys.members,
    queryFn: async () => {
      if (!user) {
        throw new Error("User is not available");
      }
      // For kas purposes, we need members from the user's eschool
      const response = await memberApi.getMembersByEschool(user.eschool_id);
      return response;
    },
    enabled: true ,
    // staleTime: 10 * 60 * 1000, // 10 minutes (members don't change often)
    // retry: (failureCount, error: any) => {
    //   if (error?.response?.status === 401 || error?.response?.status === 403) {
    //     return false;
    //   }
    //   return failureCount < 3;
    // },
  });
};

export const useAddIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IncomeFormData) => {
      const response = await kasApi.addIncome(data);
      return response;
    },
    onSuccess: (data) => {
      // Invalidate and refetch kas-related queries
      queryClient.invalidateQueries({ queryKey: kasQueryKeys.records });
      queryClient.invalidateQueries({ queryKey: kasQueryKeys.summary });
      //
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
    },
    onError: (error: any) => {
      console.error(
        "Failed to add expense:",
        error?.response?.data?.message || error.message
      );
    },
  });
};

export const useUpdateKasRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<KasExpenseData>;
    }) => {
      const response = await kasApi.updateRecord(id, data);
      return response;
    },
    onSuccess: (data) => {
      // Invalidate and refetch kas-related queries
      queryClient.invalidateQueries({ queryKey: kasQueryKeys.records });
      queryClient.invalidateQueries({ queryKey: kasQueryKeys.summary });
    },
    onError: (error: any) => {
      console.error(
        "Failed to update record:",
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
      date_from?: string;
      date_to?: string;
    }) => {
      const blob = await kasApi.exportRecords(params);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `kas-records-${new Date().toISOString().split("T")[0]}.${params.format || "csv"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return blob;
    },
    onSuccess: () => {
      // Show success message
      console.log("Export completed successfully");
    },
    onError: (error: any) => {
      console.error("Failed to export kas records:", error?.message);

      // Show error message to user
      alert(`Export failed: ${error?.message || "Unknown error"}`);
    },
  });
};

// Main hook that combines all kas management functionality
export const useKasManagement = () => {
  const recordsQuery = useKasRecords();
  const summaryQuery = useKasSummary();
  const membersQuery = useMembers();
  console.log(`THIS IS  ~ membersQuery:`, membersQuery)
  const addIncomeMutation = useAddIncome();
  const addExpenseMutation = useAddExpense();
  const updateRecordMutation = useUpdateKasRecord();
  const exportRecordsMutation = useExportKasRecords();

  // Transform the members data to match the expected structure
  // const transformedMembersData = membersQuery.data
  //   ? {
  //       eschool: {
  //         id: membersQuery?.data?.data?.[0]?.eschools[0]?.id || 0,
  //         name:
  //           membersQuery?.data?.data?.[0]?.eschools[0]?.name || "Unknown Eschool",
  //         monthly_kas_amount:
  //           membersQuery?.data?.data?.[0]?.eschools[0]?.monthly_kas_amount || 0,
  //       },
  //       members: membersQuery?.data?.data?.map((member) => ({
  //         id: member.id,
  //         student_id: member.student_id,
  //         name: member.name,
  //         email: member.user?.email || "",
  //         phone: member.phone,
  //       })),
  //     }
  //   : null;

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
    members: membersQuery?.data?.members || [],
    eschool: membersQuery?.data?.eschool,

    // Loading states
    isLoadingRecords: recordsQuery.isLoading,
    isLoadingSummary: summaryQuery.isLoading,
    isLoadingMembers: membersQuery.isLoading,
    isAddingIncome: addIncomeMutation.isPending,
    isAddingExpense: addExpenseMutation.isPending,
    isUpdatingRecord: updateRecordMutation.isPending,
    isExporting: exportRecordsMutation.isPending,

    // Error states
    recordsError: recordsQuery.error || null,
    summaryError: summaryQuery.error || null,
    membersError: membersQuery.error || null,
    addIncomeError: addIncomeMutation.error || null,
    addExpenseError: addExpenseMutation.error || null,
    updateRecordError: updateRecordMutation.error || null,
    exportError: exportRecordsMutation.error || null,

    // Actions
    addIncome: addIncomeMutation.mutate,
    addExpense: addExpenseMutation.mutate,
    updateRecord: updateRecordMutation.mutate,
    exportRecords: (
      params: any,
      options?: { onSuccess?: () => void; onError?: (error: any) => void }
    ) => {
      exportRecordsMutation.mutate(params, {
        onSuccess: options?.onSuccess,
        onError: options?.onError,
      });
    },

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
    updateRecordMutation,
    exportRecordsMutation,
  };
};