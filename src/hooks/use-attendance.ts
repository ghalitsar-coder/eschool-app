import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import attendanceApi from "@/lib/api/attendance";
import {
  AttendanceRecord,
  AttendanceStats,
  AttendanceFormData,
  UpdateAttendanceParams,
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
  const { user, getEschoolIdForRole } = useAuth();

  // Get eschool ID from user's primary role (coordinator, staff, or supervisor)
  const getEschoolId = () => {
    if (!user?.roles) return null;
    const primaryRole = user.roles.find((role) =>
      ["coordinator", "staff", "supervisor"].includes(role.role)
    );
    return primaryRole?.eschool_id || null;
  };

  const eschoolId = getEschoolId();

  const { data, isLoading, error, refetch } = useQuery<
    { data: AttendanceRecord[]; meta: AttendanceMeta },
    Error
  >({
    queryKey: ["attendance", eschoolId, params],
    queryFn: async () => {
      if (!eschoolId) {
        throw new Error("No eschool ID found");
      }
      const response = await attendanceApi.getAttendanceRecords({
        eschoolId: eschoolId,
        ...params,
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
  const { user } = useAuth();

  // Get eschool ID from user's primary role (coordinator, staff, or supervisor)
  const getEschoolId = () => {
    if (!user?.roles) return null;
    const primaryRole = user.roles.find((role) =>
      ["coordinator", "staff", "supervisor"].includes(role.role)
    );
    return primaryRole?.eschool_id || null;
  };

  const eschoolId = getEschoolId();

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
  const { user } = useAuth();

  // Get eschool ID from user's primary role (coordinator, staff, or supervisor)
  const getEschoolId = () => {
    if (!user?.roles) return null;
    const primaryRole = user.roles.find((role) =>
      ["coordinator", "staff", "supervisor"].includes(role.role)
    );
    return primaryRole?.eschool_id || null;
  };

  const eschoolId = getEschoolId();

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
  const { user } = useAuth();

  // Get eschool ID from user's primary role (coordinator, staff, or supervisor)
  const getEschoolId = () => {
    if (!user?.roles) return null;
    const primaryRole = user.roles.find((role) =>
      ["coordinator", "staff", "supervisor"].includes(role.role)
    );
    return primaryRole?.eschool_id || null;
  };

  const eschoolId = getEschoolId();

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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (data: FormData | AttendanceFormData) => {
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

      const response = await attendanceApi.recordAttendance(
        primaryRole.eschool_id,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-stats"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-analytics"] });
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
  const { user, getEschoolIdForRole, getPrimaryRole } = useAuth();

  // Use all the individual hooks with filter params
  const { records, meta, isLoadingRecords, recordsError, refetchRecords } =
    useAttendance(filterParams);

  // Import dashboard hooks for better performance
  const {
    statistics,
    analytics,
    isLoadingStatistics,
    isLoadingAnalytics,
    statisticsError,
    analyticsError,
    refetchStatistics,
    refetchAnalytics,
  } = (() => {
    try {
      // Try to use dashboard hooks if available
      const { useCoordinatorDashboard } = require("@/hooks/use-dashboard");
      return useCoordinatorDashboard(analyticsParams);
    } catch {
      // Fallback to original hooks
      const statisticsQuery = useAttendanceStatistics();
      const analyticsQuery = useAttendanceAnalytics(analyticsParams);
      return {
        statistics: statisticsQuery.statistics,
        analytics: analyticsQuery.analytics,
        isLoadingStatistics: statisticsQuery.isLoadingStatistics,
        isLoadingAnalytics: analyticsQuery.isLoadingAnalytics,
        statisticsError: statisticsQuery.statisticsError,
        analyticsError: analyticsQuery.analyticsError,
        refetchStatistics: statisticsQuery.refetchStatistics,
        refetchAnalytics: analyticsQuery.refetchAnalytics,
      };
    }
  })();

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

    // Loading states
    isLoadingRecords,
    isLoadingStatistics,
    isLoadingAnalytics,
    isLoadingMembers,
    isCreating,
    isUpdating,
    isDeleting,

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
    exportRecords,
    refetchRecords,
    refetchStatistics,
    refetchAnalytics,
  };
};
