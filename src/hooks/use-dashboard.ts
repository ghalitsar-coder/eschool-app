import { useQuery } from "@tanstack/react-query";
import dashboardApi from "@/lib/api/dashboard";
import type {
  AttendanceStatistics,
  AttendanceAnalytics,
  KasSummary,
} from "@/lib/api/dashboard";

// Query keys for better cache management
export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  attendanceStats: () =>
    [...dashboardQueryKeys.all, "attendance", "statistics"] as const,
  attendanceAnalytics: (period?: string) =>
    [...dashboardQueryKeys.all, "attendance", "analytics", period] as const,
  kasSummary: () => [...dashboardQueryKeys.all, "kas", "summary"] as const,
  // staffOverview removed - now uses multi-role-profile
};

// Hook for attendance statistics (coordinator dashboard)
export const useAttendanceStatistics = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.attendanceStats(),
    queryFn: async () => {
      const response = await dashboardApi.getAttendanceStatistics();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

// Hook for attendance analytics (coordinator dashboard)
export const useAttendanceAnalytics = (params?: { period?: string }) => {
  const { period } = params || {};

  return useQuery({
    queryKey: dashboardQueryKeys.attendanceAnalytics(period),
    queryFn: async () => {
      const response = await dashboardApi.getAttendanceAnalytics({ period });
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

// Hook for kas summary (bendahara dashboard)
export const useKasSummaryDashboard = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.kasSummary(),
    queryFn: async () => {
      const response = await dashboardApi.getKasSummary();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

// Staff dashboard now uses useMultiRoleProfile hook instead of separate API

// Combined hook for coordinator dashboard
export const useCoordinatorDashboard = (analyticsParams?: {
  period?: string;
}) => {
  const statisticsQuery = useAttendanceStatistics();
  const analyticsQuery = useAttendanceAnalytics(analyticsParams);

  return {
    // Data
    statistics: statisticsQuery.data,
    analytics: analyticsQuery.data,

    // Loading states
    isLoadingStatistics: statisticsQuery.isLoading,
    isLoadingAnalytics: analyticsQuery.isLoading,

    // Error states
    statisticsError: statisticsQuery.error,
    analyticsError: analyticsQuery.error,

    // Refetch functions
    refetchStatistics: statisticsQuery.refetch,
    refetchAnalytics: analyticsQuery.refetch,

    // Query objects for advanced usage
    statisticsQuery,
    analyticsQuery,
  };
};

// Combined hook for bendahara dashboard
export const useBendaharaDashboard = () => {
  const kasSummaryQuery = useKasSummaryDashboard();

  return {
    // Data
    summary: kasSummaryQuery.data,

    // Loading states
    isLoadingSummary: kasSummaryQuery.isLoading,

    // Error states
    summaryError: kasSummaryQuery.error,

    // Refetch functions
    refetchSummary: kasSummaryQuery.refetch,

    // Query objects for advanced usage
    kasSummaryQuery,
  };
};
