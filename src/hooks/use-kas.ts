// useKasManagement.ts - Kas management with TanStack Query based on Laravel backend
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  per_page?: number;
  eschoolId?: number;
}) => {
  const { treasurerEschoolId } = useAuth();
  const finalEschoolId = params?.eschoolId || treasurerEschoolId;

  return useQuery({
    queryKey: [
      ...kasQueryKeys.records,
      { ...params, eschoolId: finalEschoolId },
    ],
    queryFn: async () => {
      const response = await kasApi.getKasRecords({
        ...params,
        eschoolId: finalEschoolId,
      });
      return response;
    },
    enabled: !!finalEschoolId,
  });
};

export const useKasSummary = () => {
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
  const { treasurerEschoolId } = useAuth();

  return useQuery({
    queryKey: kasQueryKeys.members,
    queryFn: async () => {
      const response = await memberApi.getMembersByEschool(treasurerEschoolId);
      return response;
    },
    enabled: !!treasurerEschoolId,
    select: (data) => {
      // Transform the data to match what the components expect
      return data?.data?.members || [];
    },
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
  const { treasurerEschoolId } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      type?: "income" | "expense";
      month?: number;
      year?: number;
      format?: "csv" | "excel";
      date_from?: string;
      date_to?: string;
    }) => {
      const blob = await kasApi.exportRecords({
        ...params,
        eschoolId: treasurerEschoolId,
      });

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
      // Show success message
      toast.success("Export completed successfully");
    },
    onError: (error: any) => {
      console.error("Failed to export kas records:", error?.message);

      // Show error message to user
      toast.error(`Export failed: ${error?.message || "Unknown error"}`);
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
  const updateRecordMutation = useUpdateKasRecord();
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
    members: membersQuery.data || [],
    // eschool: membersQuery?.data?.eschool,

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
        onError: (error) => {
          // Call the onError callback if provided
          if (options?.onError) {
            options.onError(error);
          }
        },
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
