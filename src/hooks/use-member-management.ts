import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { multiRoleMemberApi } from '@/app/dashboard/eschool/[id]/members/services/multiRoleMemberService';

// Types
interface UserEschoolRole {
  user_id: number;
  name: string;
  email: string;
  student_id: string;
  phone: string;
  role_in_eschool: string;
  permissions: string[];
  status: string;
  assigned_at: string;
  member_details: {
    gender: string | null;
    address: string | null;
    date_of_birth: string | null;
  };
  other_roles: Array<{
    eschool_id: number;
    eschool_name: string;
    role: string;
  }>;
  attendance_summary: {
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

interface RoleSummary {
  [key: string]: number;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface UseMembersParams {
  page?: number;
  perPage?: number;
  search?: string;
  roleFilter?: string;
  eschoolId?: number;
}

// Hook to fetch members
export const useMembers = (params?: UseMembersParams) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['members', params],
    queryFn: async () => {
      if (!params?.eschoolId) {
        throw new Error('Eschool ID is required');
      }
      
      const response = await multiRoleMemberApi.getMembers(params.eschoolId, {
        page: params.page,
        per_page: params.perPage,
        search: params.search,
        role_filter: params.roleFilter
      });
      return response;
    },
    enabled: !!params?.eschoolId
  });

  return {
    members: data?.data,
    roleSummary: data?.role_summary,
    pagination: data?.pagination,
    isLoadingMembers: isLoading,
    membersError: error || null,
    fetchMembers: refetch,
  };
};

// Hook to fetch available users
export const useAvailableUsers = (eschoolId: number) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['available-users', eschoolId],
    queryFn: async () => {
      const response = await multiRoleMemberApi.getAvailableUsers(eschoolId);
      return response;
    },
    enabled: !!eschoolId
  });

  return {
    users: data?.data,
    isLoadingUsers: isLoading,
    usersError: error || null,
    fetchUsers: refetch,
  };
};

// Hook to assign role
interface AssignRoleParams {
  eschoolId: number;
  user_id: number;
  role: string;
  member_details?: {
    student_id?: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;
    phone?: string;
  };
}

export const useAssignRole = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (data: AssignRoleParams) => {
      const { eschoolId, ...rest } = data;
      const response = await multiRoleMemberApi.assignRole(eschoolId, rest);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['available-users', variables.eschoolId] });
    },
  });

  return {
    assignRole: mutateAsync,
    isAssigning: isPending,
    assignError: error || null,
  };
};

// Hook to update role
interface UpdateRoleParams {
  eschoolId: number;
  userId: number;
  role: string;
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (data: UpdateRoleParams) => {
      const { eschoolId, userId, ...rest } = data;
      const response = await multiRoleMemberApi.updateRole(eschoolId, userId, rest);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  return {
    updateRole: mutateAsync,
    isUpdating: isPending,
    updateError: error || null,
  };
};

// Hook to remove role
export const useRemoveRole = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ eschoolId, userId }: { eschoolId: number; userId: number }) => {
      const response = await multiRoleMemberApi.removeRole(eschoolId, userId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  return {
    removeRole: mutateAsync,
    isRemoving: isPending,
    removeError: error || null,
  };
};

// Combined hook for member management
interface UseMemberManagementParams extends UseMembersParams {
  userRole?: string;
}

export const useMemberManagement = (params?: UseMemberManagementParams) => {
  // Use all the individual hooks
  const { members, roleSummary, pagination, isLoadingMembers, membersError, fetchMembers } = useMembers(params);
  const { users, isLoadingUsers, usersError, fetchUsers } = useAvailableUsers(params?.eschoolId || 0);
  const { assignRole, isAssigning, assignError } = useAssignRole();
  const { updateRole, isUpdating, updateError } = useUpdateRole();
  const { removeRole, isRemoving, removeError } = useRemoveRole();

  return {
    // Data
    members,
    users,
    roleSummary,
    pagination,
    
    // Loading states
    isLoadingMembers,
    isLoadingUsers,
    isAssigning,
    isUpdating,
    isRemoving,
    
    // Errors
    membersError,
    usersError,
    assignError,
    updateError,
    removeError,
    
    // Functions
    fetchMembers,
    fetchAvailableUsers: fetchUsers,
    assignRole,
    updateRole,
    removeRole,
  };
};