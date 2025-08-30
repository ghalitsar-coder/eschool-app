import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import attendanceApi from '@/lib/api/attendance';
import { 
  AttendanceRecord, 
  AttendanceStats, 
  AttendanceFormData,
  UpdateAttendanceParams
} from '@/types/api';
import { useAuth } from './use-auth';

// Types for our hooks
interface UseAttendanceParams {
  date?: string;
  start_date?: string;
  end_date?: string;
}

interface UseAttendanceReturn {
  records: AttendanceRecord[] | undefined;
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

interface UseMembersReturn {
  members: any[] | undefined;
  isLoadingMembers: boolean;
  membersError: Error | null;
}

interface UseCreateAttendanceReturn {
  createAttendance: (data: AttendanceFormData) => Promise<void>;
  isCreating: boolean;
  createError: Error | null;
}

interface UseUpdateAttendanceReturn {
  updateAttendance: (params: { id: number; data: any }) => Promise<void>;
  isUpdating: boolean;
  updateError: Error | null;
}

interface UseDeleteAttendanceReturn {
  deleteAttendance: (id: number) => Promise<void>;
  isDeleting: boolean;
  deleteError: Error | null;
}

// Hook to fetch attendance records
export const useAttendance = (params?: UseAttendanceParams): UseAttendanceReturn => {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery<AttendanceRecord[], Error>({
    queryKey: ['attendance', user?.eschool_id, params],
    queryFn: async () => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await attendanceApi.getAttendanceRecords({
        eschoolId: user.eschool_id,
        ...params
      });
      return response;
    },
    enabled: !!user?.eschool_id,
  });

  return {
    records: data,
    isLoadingRecords: isLoading,
    recordsError: error || null,
    refetchRecords: refetch,
  };
};

// Hook to fetch attendance statistics
export const useAttendanceStatistics = (): UseStatisticsReturn => {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery<AttendanceStats, Error>({
    queryKey: ['attendance-statistics', user?.eschool_id],
    queryFn: async () => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await attendanceApi.getAttendanceStatistics(user.eschool_id);
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

// Hook to fetch members for attendance
export const useAttendanceMembers = (): UseMembersReturn => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery<any[], Error>({
    queryKey: ['attendance-members', user?.eschool_id],
    queryFn: async () => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      // Assuming we have an API endpoint to get members for an eschool
      // This would need to be implemented in the backend
      const response = await attendanceApi.getAttendanceMembers(user.eschool_id);
      return response;
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
    mutationFn: async (data: AttendanceFormData) => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await attendanceApi.recordAttendance({
        eschool_id: user.eschool_id,
        ...data
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch attendance queries
      queryClient.invalidateQueries({ queryKey: ['attendance', user?.eschool_id] });
      queryClient.invalidateQueries({ queryKey: ['attendance-statistics', user?.eschool_id] });
    },
  });

  return {
    createAttendance: mutateAsync,
    isCreating: isPending,
    createError: error || null,
  };
};

// Hook to update attendance records
export const useUpdateAttendance = (): UseUpdateAttendanceReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await attendanceApi.updateAttendance(id, {
        eschool_id: user.eschool_id,
        ...data
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch attendance queries
      queryClient.invalidateQueries({ queryKey: ['attendance', user?.eschool_id] });
      queryClient.invalidateQueries({ queryKey: ['attendance-statistics', user?.eschool_id] });
    },
  });

  return {
    updateAttendance: mutateAsync,
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
      const response = await attendanceApi.deleteAttendance(id);
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch attendance queries
      queryClient.invalidateQueries({ queryKey: ['attendance', user?.eschool_id] });
      queryClient.invalidateQueries({ queryKey: ['attendance-statistics', user?.eschool_id] });
    },
  });

  return {
    deleteAttendance: mutateAsync,
    isDeleting: isPending,
    deleteError: error || null,
  };
};

// Combined hook for attendance management
export const useAttendanceManagement = () => {
  const { user } = useAuth();
  
  // Use all the individual hooks
  const { records, isLoadingRecords, recordsError, refetchRecords } = useAttendance();
  const { statistics, isLoadingStatistics, statisticsError, refetchStatistics } = useAttendanceStatistics();
  const { members, isLoadingMembers, membersError } = useAttendanceMembers();
  const { createAttendance, isCreating, createError } = useCreateAttendance();
  const { updateAttendance, isUpdating, updateError } = useUpdateAttendance();
  const { deleteAttendance, isDeleting, deleteError } = useDeleteAttendance();

  return {
    // Data
    records,
    statistics,
    members,
    
    // Loading states
    isLoadingRecords,
    isLoadingStatistics,
    isLoadingMembers,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Errors
    recordsError,
    statisticsError,
    membersError,
    createError,
    updateError,
    deleteError,
    
    // Functions
    createAttendance,
    updateAttendance,
    deleteAttendance,
    refetchRecords,
    refetchStatistics,
  };
};