import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import multiRoleProfileApi from '@/lib/api/multi-role-profile';

// Types (re-exported from API)
interface User {
  id: number;
  name: string;
  email: string;
  base_role: string;
  is_system_admin: boolean;
}

interface KasSummary {
  total_balance?: number;
  monthly_target?: number;
  collection_rate?: number;
  pending_approvals?: number;
  personal_balance?: number;
  payment_status?: 'up_to_date' | 'overdue' | 'partial';
}

interface AttendanceSummary {
  total_meetings: number;
  attended: number;
  attendance_rate: number;
}

interface EschoolRole {
  eschool_id: number;
  eschool_name: string;
  school_id: number;
  role_in_eschool: string;
  permissions: string[];
  assigned_at: string;
  status: 'active' | 'inactive';
  kas_summary: KasSummary;
  attendance_summary: AttendanceSummary;
}

interface PerformanceMetrics {
  avg_attendance_rate: number;
  total_kas_managed: number;
  total_personal_kas: number;
  overall_activity_score: number;
}

interface OverallSummary {
  total_eschools: number;
  roles: {
    koordinator: number;
    bendahara: number;
    member: number;
  };
  performance: PerformanceMetrics;
}

interface RecentActivity {
  type: 'kas_transaction' | 'attendance' | 'role_assignment';
  eschool_name: string;
  description: string;
  amount?: number;
  date: string;
  role_context: string;
}

export interface MultiRoleProfileData {
  user: User;
  eschool_roles: EschoolRole[];
  overall_summary: OverallSummary;
  recent_activities: RecentActivity[];
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

// Hook to fetch multi-role profile data
export const useMultiRoleProfile = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['multi-role-profile'],
    queryFn: async () => {
      try {
        const response = await multiRoleProfileApi.getProfile();
        console.log(`🚀 ~ use-multi-role-profile.ts:85 ~ response:`, response);
        
        // Return the data from the response
        if (response && response.data) {
          return response.data;
        }
        
        // This should never happen with our updated API client, but just in case
        throw new Error("No data received from API");
      } catch (err) {
        console.error("Error in query function:", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Retry once on failure
  });

  return {
    profileData: data,
    isLoadingProfile: isLoading,
    profileError: error || null,
    refetchProfile: refetch,
  };
};

// Hook to update profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await multiRoleProfileApi.updateProfile(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate profile queries
      queryClient.invalidateQueries({ queryKey: ['multi-role-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const updateProfile = async (data: UpdateProfileData): Promise<User> => {
    const result = await mutateAsync(data);
    if (!result) {
      throw new Error("Failed to update profile");
    }
    return result;
  };

  return {
    updateProfile,
    isUpdatingProfile: isPending,
    updateProfileError: error || null,
  };
};

// Hook to change password
export const useChangePassword = () => {
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const response = await multiRoleProfileApi.changePassword(data);
      return response;
    },
  });

  const changePassword = async (data: ChangePasswordData): Promise<void> => {
    await mutateAsync(data);
  };

  return {
    changePassword,
    isChangingPassword: isPending,
    changePasswordError: error || null,
  };
};
