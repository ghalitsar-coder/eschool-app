import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import memberManagementApi from '@/lib/api/member-management';

// Types for enhanced member management
interface EnhancedMember {
  user_id: number;
  name: string;
  email: string;
  student_id?: string;
  phone?: string;
  role_in_eschool: string;
  permissions: string[];
  status: 'active' | 'inactive';
  assigned_at: string;
  member_details?: {
    gender?: string;
    address?: string;
    date_of_birth?: string;
  };
  other_roles?: Array<{
    eschool_id: number;
    eschool_name: string;
    role: string;
  }>;
  attendance_summary?: {
    total_sessions: number;
    attended: number;
    attendance_rate: number;
  };
}

interface AvailableUser {
  id: number;
  name: string;
  email: string;
  base_role: string;
  current_eschool_roles: Array<{
    eschool_id: number;
    eschool_name: string;
    role: string;
  }>;
  available_roles: string[];
  qwen_compliant: boolean;
  can_assign_koordinator: boolean;
}

interface AssignRolePayload {
  user_id: number;
  role: 'koordinator' | 'bendahara' | 'member';
  member_details?: {
    nip?: string;
    student_id?: string;
    date_of_birth?: string;
    gender?: 'L' | 'P';
    address?: string;
    phone?: string;
  };
  create_user_if_not_exists?: boolean;
}

interface CreateUserPayload {
  user_data: {
    name: string;
    email: string;
    password?: string;
    base_role: 'siswa' | 'guru' | 'staff';
  };
}

interface UseMemberManagementParams {
  page?: number;
  per_page?: number;
  search?: string;
  role_filter?: string;
}

// Hook to fetch members for management (koordinator access)
export const useMemberManagement = (params?: UseMemberManagementParams) => {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['member-management', user?.eschool_id, params],
    queryFn: async () => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await memberManagementApi.getMembers({
        eschoolId: user.eschool_id,
        ...params,
      });
      return response;
    },
    enabled: !!user?.eschool_id,
  });

  return {
    members: data?.data,
    roleSummary: data?.role_summary,
    pagination: data?.pagination,
    isLoadingMembers: isLoading,
    membersError: error || null,
    refetchMembers: refetch,
  };
};

// Hook to fetch available users for assignment
export const useAvailableUsers = () => {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['available-users', user?.eschool_id],
    queryFn: async () => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await memberManagementApi.getAvailableUsers(user.eschool_id);
      return response.data;
    },
    enabled: !!user?.eschool_id,
  });

  return {
    availableUsers: data,
    isLoadingAvailableUsers: isLoading,
    availableUsersError: error || null,
    refetchAvailableUsers: refetch,
  };
};

// Hook to assign role to user
export const useAssignRole = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (data: AssignRolePayload) => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await memberManagementApi.assignRole(user.eschool_id, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['member-management'] });
      queryClient.invalidateQueries({ queryKey: ['available-users'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-members'] });
    },
  });

  const assignRole = async (data: AssignRolePayload): Promise<EnhancedMember> => {
    const result = await mutateAsync(data);
    if (!result) {
      throw new Error("Failed to assign role");
    }
    return result;
  };

  return {
    assignRole,
    isAssigningRole: isPending,
    assignRoleError: error || null,
  };
};

// Hook to update role for user
export const useUpdateRole = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: Partial<AssignRolePayload> }) => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await memberManagementApi.updateRole(user.eschool_id, userId, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['member-management'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-members'] });
    },
  });

  const updateRole = async (userId: number, data: Partial<AssignRolePayload>): Promise<EnhancedMember> => {
    const result = await mutateAsync({ userId, data });
    if (!result) {
      throw new Error("Failed to update role");
    }
    return result;
  };

  return {
    updateRole,
    isUpdatingRole: isPending,
    updateRoleError: error || null,
  };
};

// Hook to remove role from user
export const useRemoveRole = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (userId: number) => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await memberManagementApi.removeRole(user.eschool_id, userId);
      return response;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['member-management'] });
      queryClient.invalidateQueries({ queryKey: ['available-users'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-members'] });
    },
  });

  const removeRole = async (userId: number): Promise<void> => {
    await mutateAsync(userId);
  };

  return {
    removeRole,
    isRemovingRole: isPending,
    removeRoleError: error || null,
  };
};

// Hook to create user and assign role
export const useCreateUserAndAssignRole = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (data: CreateUserPayload & AssignRolePayload) => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await memberManagementApi.createUserAndAssignRole(user.eschool_id, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['member-management'] });
      queryClient.invalidateQueries({ queryKey: ['available-users'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-members'] });
    },
  });

  const createUserAndAssignRole = async (data: CreateUserPayload & AssignRolePayload): Promise<EnhancedMember> => {
    const result = await mutateAsync(data);
    if (!result) {
      throw new Error("Failed to create user and assign role");
    }
    return result;
  };

  return {
    createUserAndAssignRole,
    isCreatingUserAndAssigningRole: isPending,
    createUserAndAssignRoleError: error || null,
  };
};
