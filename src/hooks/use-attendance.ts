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
  updateAttendance: (params: { id: number; data: Partial<AttendanceFormData> }) => Promise<void>;
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
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery<
    { data: AttendanceRecord[]; meta: AttendanceMeta },
    Error
  >({
    queryKey: ["attendance", user?.eschool_id, params],
    queryFn: async () => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await attendanceApi.getAttendanceRecords({
        eschoolId: user.eschool_id,
        ...params,
      });
      return response;
    },
    enabled: !!user?.eschool_id,
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

  const { data, isLoading, error, refetch } = useQuery<AttendanceStats, Error>({
    queryKey: ["attendance-statistics", user?.eschool_id],
    queryFn: async () => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await attendanceApi.getAttendanceStatistics(
        user.eschool_id
      );
      return response;
    },
    enabled: !!user?.eschool_id,
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

  const { data, isLoading, error, refetch } = useQuery<
    AttendanceAnalytics,
    Error
  >({
    queryKey: [
      "attendance-analytics",
      user?.eschool_id,
      params?.period || "week",
    ],
    queryFn: async () => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await attendanceApi.getAttendanceAnalytics({
        eschoolId: user.eschool_id,
        period: params?.period || "week",
      });
      // Response already is AttendanceAnalytics, no need to extract data
      return response;
    },
    enabled: !!user?.eschool_id,
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
  console.log(`THIS IS  ~ user:`, user);

  const { data, isLoading, error } = useQuery<AttendanceMember[], Error>({
    queryKey: ["attendance-members", user?.eschool_id],
    queryFn: async () => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      // Use the new multi-role attendance members API
      const response = await attendanceApi.getAttendanceMembers(user.eschool_id);
      console.log(`THIS IS  ~ response:`, response.slice(0, 3));
      return response || [];
    },
    enabled: !!user?.eschool_id,
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
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await attendanceApi.recordAttendance(user.eschool_id, data);
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<AttendanceFormData> }) => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await attendanceApi.updateAttendance(user.eschool_id, id, data);
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch attendance queries
      queryClient.invalidateQueries({
        queryKey: ["attendance", user?.eschool_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["attendance-statistics", user?.eschool_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["attendance-analytics", user?.eschool_id],
      });
    },
  });

  const updateAttendance = async (params: { id: number; data: Partial<AttendanceFormData> }): Promise<void> => {
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
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await attendanceApi.deleteAttendance(user.eschool_id, id);
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch attendance queries
      queryClient.invalidateQueries({
        queryKey: ["attendance", user?.eschool_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["attendance-statistics", user?.eschool_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["attendance-analytics", user?.eschool_id],
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
  const { user } = useAuth();

  // Use all the individual hooks with filter params
  const { records, meta, isLoadingRecords, recordsError, refetchRecords } =
    useAttendance(filterParams);
  const {
    statistics,
    isLoadingStatistics,
    statisticsError,
    refetchStatistics,
  } = useAttendanceStatistics();
  const { analytics, isLoadingAnalytics, analyticsError, refetchAnalytics } =
    useAttendanceAnalytics(analyticsParams);
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
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }

      const exportParams = {
        eschool_id: user.eschool_id,
        ...params,
      };

      const blob = await attendanceApi.exportRecords(exportParams);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `attendance_records_${new Date().toISOString().split("T")[0]}.${params.format || "csv"}`;
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