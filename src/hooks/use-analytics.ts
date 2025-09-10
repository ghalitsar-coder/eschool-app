// useAnalytics.ts - Hooks for analytics data with TanStack Query
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import apiClient from "@/lib/api/client";

// Query keys for better cache management
export const analyticsQueryKeys = {
  all: ["analytics"] as const,
  eschools: () => [...analyticsQueryKeys.all, "eschools"] as const,
  // financial query key commented out as it's only used for financial components
  // financial: () => [...analyticsQueryKeys.all, "financial"] as const,
  attendance: () => [...analyticsQueryKeys.all, "attendance"] as const,
};

// Hook untuk mengambil data analytics eschool
export const useEschoolAnalytics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: analyticsQueryKeys.eschools(),
    queryFn: async () => {
      const response = await apiClient.get("/analytics/eschools");
      return response.data;
    },
    enabled: !!user,
  });
};

// Hook untuk mengambil data financial analytics (commented out as per requirements)
/*
export const useFinancialAnalytics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: analyticsQueryKeys.financial(),
    queryFn: async () => {
      try {
        const response = await apiClient.get("/analytics/financial");
        return response.data;
      } catch (error: any) {
        // Jika staff mencoba mengakses financial data, kembalikan data kosong
        if (error.response?.status === 403) {
          return {
            totalIncome: 0,
            totalExpense: 0,
            netBalance: 0,
            monthlyTrends: [],
            expenseCategories: [],
            memberContributions: []
          };
        }
        throw error;
      }
    },
    enabled: !!user,
  });
};
*/

// Hook untuk mengambil data attendance analytics
export const useAttendanceAnalytics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: analyticsQueryKeys.attendance(),
    queryFn: async () => {
      const response = await apiClient.get("/analytics/attendance");
      return response.data;
    },
    enabled: !!user,
  });
};

// Main hook yang menggabungkan semua analytics
export const useAnalytics = () => {
  const eschoolAnalytics = useEschoolAnalytics();
  // financialAnalytics commented out as it's only used for financial components
  // const financialAnalytics = useFinancialAnalytics();
  const attendanceAnalytics = useAttendanceAnalytics();
  
  return {
    // Data
    eschoolData: eschoolAnalytics.data,
    // financialData commented out as it's only used for financial components
    // financialData: financialAnalytics.data,
    attendanceData: attendanceAnalytics.data,
    
    // Loading states
    isLoadingEschoolData: eschoolAnalytics.isLoading,
    // isLoadingFinancialData commented out as it's only used for financial components
    // isLoadingFinancialData: financialAnalytics.isLoading,
    isLoadingAttendanceData: attendanceAnalytics.isLoading,
    
    // Error states
    eschoolError: eschoolAnalytics.error,
    // financialError commented out as it's only used for financial components
    // financialError: financialAnalytics.error,
    attendanceError: attendanceAnalytics.error,
    
    // Refetch functions
    refetchEschoolData: eschoolAnalytics.refetch,
    // refetchFinancialData commented out as it's only used for financial components
    // refetchFinancialData: financialAnalytics.refetch,
    refetchAttendanceData: attendanceAnalytics.refetch,
  };
};