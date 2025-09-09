import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import attendanceApi from "@/lib/api/attendance";
import {
  AttendanceRecord,
  AttendanceStats,
  AttendanceFormData,
  AttendanceAnalytics,
  AttendanceMember,
} from "@/types/api";
import { useAuth } from "./use-auth";

// Types for our hooks
interface UseAttendanceParams {
  date?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  member_id?: number;
  is_present?: boolean;
  page?: number;
  per_page?: number;
}

interface AttendanceMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

interface UseAttendanceReturn {
  records: AttendanceRecord[] | undefined;
  meta: AttendanceMeta | undefined;
  isLoadingRecords: boolean;
  recordsError: Error | null;
  refetchRecords: () => void;
}

interface UseStatisticsReturn {
  statistics: AttendanceStats | undefined;
  isLoadingStatistics: boolean;
  statisticsError: Error | null;
  refetchStatistics: () => void;
}

interface UseAnalyticsParams {
  period?: string;
}

interface UseAnalyticsReturn {
  analytics: AttendanceAnalytics | undefined;
  isLoadingAnalytics: boolean;
  analyticsError: Error | null;
  refetchAnalytics: () => void;
}

interface UseMembersReturn {
  members: AttendanceMember[] | undefined;
  isLoadingMembers: boolean;
  membersError: Error | null;
}

interface UseCreateAttendanceReturn {
  createAttendance: (data: AttendanceFormData) => Promise<void>;
  isCreating: boolean;
  createError: Error | null;
}

interface UseUpdateAttendanceReturn {
  updateAttendance: (params: {
    id: number;
    data: Partial<AttendanceFormData>;
  }) => Promise<void>;
  isUpdating: boolean;
  updateError: Error | null;
}

interface UseDeleteAttendanceReturn {
  deleteAttendance: (id: number) => Promise<void>;
  isDeleting: boolean;
  deleteError: Error | null;
}

// Hook to fetch attendance records
export const useAttendance = (
  params?: UseAttendanceParams
): UseAttendanceReturn => {
  console.log(`THIS IS  ~ params:`, params);
  const { getEschoolIdForRole } = useAuth();

  // Get eschool ID from user's primary role (coordinator, staff, or supervisor)

  const eschoolId = getEschoolIdForRole("coordinator");
  console.log(`THIS IS  ~ eschoolId:`, eschoolId);

  const { data, isLoading, error, refetch } = useQuery<
    { data: AttendanceRecord[]; meta: AttendanceMeta },
    Error
  >({
    queryKey: ["attendance", eschoolId, params],
    queryFn: async () => {
      if (!eschoolId) {
        throw new Error("No eschool ID found");
      }
      console.log(`THIS IS  ~ eschoolId: 2 222`, eschoolId);
      const response = await attendanceApi.getAttendanceRecords({
        ...params,
        eschoolId,
      });
      return response;
    },
    enabled: !!eschoolId,
  });

  return {
    records: data?.data,
    meta: data?.meta,
    isLoadingRecords: isLoading,
    recordsError: error || null,
    refetchRecords: refetch,
  };
};

// Hook to fetch attendance statistics
export const useAttendanceStatistics = (): UseStatisticsReturn => {
  const { getEschoolIdForRole } = useAuth();

  const eschoolId = getEschoolIdForRole("coordinator");
  console.log(`THIS IS  ~ eschoolId:555`, eschoolId);

  const { data, isLoading, error, refetch } = useQuery<AttendanceStats, Error>({
    queryKey: ["attendance-statistics", eschoolId],
    queryFn: async () => {
      if (!eschoolId) {
        throw new Error("No eschool ID found");
      }
      const response = await attendanceApi.getAttendanceStatistics(eschoolId);
      return response;
    },
    enabled: !!eschoolId,
  });

  return {
    statistics: data,
    isLoadingStatistics: isLoading,
    statisticsError: error || null,
    refetchStatistics: refetch,
  };
};

// Hook to fetch attendance analytics
export const useAttendanceAnalytics = (
  params?: UseAnalyticsParams
): UseAnalyticsReturn => {
  const { getEschoolIdForRole } = useAuth();

  // Get eschool ID from user's primary role (coordinator, staff, or supervisor)

  const eschoolId = getEschoolIdForRole("coordinator");

  const { data, isLoading, error, refetch } = useQuery<
    AttendanceAnalytics,
    Error
  >({
    queryKey: ["attendance-analytics", eschoolId, params?.period || "week"],
    queryFn: async () => {
      if (!eschoolId) {
        throw new Error("No eschool ID found");
      }
      const response = await attendanceApi.getAttendanceAnalytics({
        eschoolId: eschoolId,
        period: params?.period || "week",
      });
      // Response already is AttendanceAnalytics, no need to extract data
      return response;
    },
    enabled: !!eschoolId,
  });

  return {
    analytics: data,
    isLoadingAnalytics: isLoading,
    analyticsError: error || null,
    refetchAnalytics: refetch,
  };
};

// Hook to fetch members for attendance using new multi-role API
export const useAttendanceMembers = (): UseMembersReturn => {
  const { getEschoolIdForRole } = useAuth();

  const eschoolId = getEschoolIdForRole("coordinator");

  const { data, isLoading, error } = useQuery<AttendanceMember[], Error>({
    queryKey: ["attendance-members", eschoolId],
    queryFn: async () => {
      if (!eschoolId) {
        throw new Error("No eschool ID found");
      }
      // Use the new multi-role attendance members API
      const response = await attendanceApi.getAttendanceMembers(eschoolId);

      return response || [];
    },
    enabled: !!eschoolId,
  });

  return {
    members: data,
    isLoadingMembers: isLoading,
    membersError: error || null,
  };
};

// Hook to create attendance records
export const useCreateAttendance = (): UseCreateAttendanceReturn => {
  const { getEschoolIdForRole } = useAuth();
  const queryClient = useQueryClient();
  const eschoolId = getEschoolIdForRole("coordinator");
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (data: FormData | AttendanceFormData) => {
      if (!eschoolId) {
        throw new Error("No eschool ID found");
      }
      const response = await attendanceApi.recordAttendance(eschoolId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-stats"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-analytics"] });
    },
    onError: (error: unknown) => {
      // Only log non-validation errors to avoid console spam
      const axiosError = error as { response?: { status?: number } };
      if (axiosError?.response?.status !== 422) {
        console.error("Attendance creation error:", error);
      }
    },
  });

  const createAttendance = async (data: AttendanceFormData): Promise<void> => {
    await mutateAsync(data);
  };

  return {
    createAttendance,
    isCreating: isPending,
    createError: error || null,
  };
};

// Hook to update attendance records
export const useUpdateAttendance = (): UseUpdateAttendanceReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<AttendanceFormData>;
    }) => {
      console.log("Update attendance - ID:", id);
      console.log("Update attendance - Data:", data);

      if (!user?.roles) {
        throw new Error("No user roles found");
      }

      // Get eschool ID from user's primary role (coordinator, staff, or supervisor)
      const primaryRole = user.roles.find((role) =>
        ["coordinator", "staff", "supervisor"].includes(role.role)
      );

      if (!primaryRole) {
        throw new Error("No valid role found for attendance management");
      }

      const response = await attendanceApi.updateAttendance(
        primaryRole.eschool_id,
        id,
        data
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch attendance queries
      queryClient.invalidateQueries({
        queryKey: ["attendance"],
      });
      queryClient.invalidateQueries({
        queryKey: ["attendance-statistics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["attendance-analytics"],
      });
    },
    onError: (error: unknown) => {
      // Only log non-validation errors to avoid console spam
      const axiosError = error as { response?: { status?: number } };
      if (axiosError?.response?.status !== 422) {
        console.error("Attendance update error:", error);
      }
    },
  });

  const updateAttendance = async (params: {
    id: number;
    data: Partial<AttendanceFormData>;
  }): Promise<void> => {
    await mutateAsync(params);
  };

  return {
    updateAttendance,
    isUpdating: isPending,
    updateError: error || null,
  };
};

// Hook to delete attendance records
export const useDeleteAttendance = (): UseDeleteAttendanceReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (id: number) => {
      if (!user?.roles) {
        throw new Error("No user roles found");
      }

      // Get eschool ID from user's primary role (coordinator, staff, or supervisor)
      const primaryRole = user.roles.find((role) =>
        ["coordinator", "staff", "supervisor"].includes(role.role)
      );

      if (!primaryRole) {
        throw new Error("No valid role found for attendance management");
      }

      const response = await attendanceApi.deleteAttendance(
        primaryRole.eschool_id,
        id
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch attendance queries
      queryClient.invalidateQueries({
        queryKey: ["attendance"],
      });
      queryClient.invalidateQueries({
        queryKey: ["attendance-statistics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["attendance-analytics"],
      });
    },
    onError: (error: unknown) => {
      // Only log non-validation errors to avoid console spam
      const axiosError = error as { response?: { status?: number } };
      if (axiosError?.response?.status !== 422) {
        console.error("Attendance delete error:", error);
      }
    },
  });

  const deleteAttendance = async (id: number): Promise<void> => {
    await mutateAsync(id);
  };

  return {
    deleteAttendance,
    isDeleting: isPending,
    deleteError: error || null,
  };
};

// Combined hook for attendance management with server-side filtering
export const useAttendanceManagement = (
  analyticsParams?: UseAnalyticsParams,
  filterParams?: UseAttendanceParams
) => {
  const { user } = useAuth();

  // Use all the individual hooks with filter params
  const { records, meta, isLoadingRecords, recordsError, refetchRecords } =
    useAttendance(filterParams);

  // Use individual hooks directly (hooks must be called at the top level)
  const statisticsQuery = useAttendanceStatistics();
  const analyticsQuery = useAttendanceAnalytics(analyticsParams);

  const statistics = statisticsQuery.statistics;
  console.log(`THIS IS  ~ statistics:`, statistics);
  const analytics = analyticsQuery.analytics;
  const isLoadingStatistics = statisticsQuery.isLoadingStatistics;
  const isLoadingAnalytics = analyticsQuery.isLoadingAnalytics;
  const statisticsError = statisticsQuery.statisticsError;
  const analyticsError = analyticsQuery.analyticsError;
  const refetchStatistics = statisticsQuery.refetchStatistics;
  const refetchAnalytics = analyticsQuery.refetchAnalytics;

  const { members, isLoadingMembers, membersError } = useAttendanceMembers();
  const { createAttendance, isCreating, createError } = useCreateAttendance();
  const { updateAttendance, isUpdating, updateError } = useUpdateAttendance();
  const { deleteAttendance, isDeleting, deleteError } = useDeleteAttendance();

  // Export function
  const exportRecords = async (params: {
    start_date?: string;
    end_date?: string;
    format?: "csv" | "pdf";
  }) => {
    try {
      if (!user?.roles) {
        throw new Error("No user roles found");
      }

      // Get eschool ID from user's primary role (coordinator, staff, or supervisor)
      const primaryRole = user.roles.find((role) =>
        ["coordinator", "staff", "supervisor"].includes(role.role)
      );

      if (!primaryRole) {
        throw new Error("No valid role found for attendance management");
      }

      const exportParams = {
        eschool_id: primaryRole.eschool_id,
        ...params,
      };

      const blob = await attendanceApi.exportRecords(exportParams);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `attendance_records_${
        new Date().toISOString().split("T")[0]
      }.${params.format || "csv"}`;
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return blob;
    } catch (error: unknown) {
      console.error("Export error:", error);
      throw error;
    }
  };

  return {
    // Data
    records,
    meta,
    statistics,
    analytics,
    members,

    // Pagination (alias for meta for backward compatibility)
    pagination: meta
      ? {
          currentPage: meta.current_page,
          totalPages: meta.last_page,
          total: meta.total,
          perPage: meta.per_page,
          from: meta.from,
          to: meta.to,
          hasNextPage: meta.has_next_page,
          hasPrevPage: meta.has_prev_page,
        }
      : undefined,

    // Loading states
    isLoadingRecords,
    isLoadingStatistics,
    isLoadingAnalytics,
    isLoadingMembers,
    isCreating,
    isUpdating,
    isDeleting,
    isExporting: false, // Add this for export functionality

    // Errors
    recordsError,
    statisticsError,
    analyticsError,
    membersError,
    createError,
    updateError,
    deleteError,

    // Functions
    createAttendance,
    updateAttendance,
    deleteAttendance,
    exportAttendance: exportRecords, // Alias for backward compatibility
    exportRecords,
    refetchRecords,
    refetchStatistics,
    refetchAnalytics,
  };
};
