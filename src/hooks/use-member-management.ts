import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberApi } from '@/lib/api/member';

// Types
interface Member {
  id: number;
  school_id: number;
  user_id: number;
  nip: string | null;
  name: string;
  student_id: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  position: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  school?: {
    id: number;
    name: string;
  };
  eschools?: Array<{
    id: number;
    name: string;
  }>;
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
  sortBy?: string;
  sortDirection?: string;
}

// Hook to fetch members
export const useMembers = (params?: UseMembersParams) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['members', params],
    queryFn: async () => {
      const response = await memberApi.getMembers(params);
      return response;
    },
  });

  return {
    members: data?.data,
    pagination: data?.pagination,
    isLoadingMembers: isLoading,
    membersError: error || null,
    fetchMembers: refetch,
  };
};

// Hook to fetch schools
interface School {
  id: number;
  name: string;
}

export const useSchools = () => {
  const { data, isLoading, error, refetch } = useQuery<School[], Error>({
    queryKey: ['schools'],
    queryFn: async () => {
      const response = await memberApi.getSchools();
      return response.data;
    },
  });

  return {
    schools: data,
    isLoadingSchools: isLoading,
    schoolsError: error || null,
    fetchSchools: refetch,
  };
};

// Hook to create member
interface CreateMemberParams {
  create_new_user: boolean;
  existing_user_id?: number;
  new_user_name?: string;
  new_user_email?: string;
  new_user_password?: string;
  nip?: string;
  name: string;
  student_id?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  phone?: string;
  email?: string;
  position?: string;
  status?: string;
}

export const useCreateMember = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (data: CreateMemberParams) => {
      const response = await memberApi.createMember(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  return {
    createMember: mutateAsync,
    isCreating: isPending,
    createError: error || null,
  };
};

// Hook to update member
interface UpdateMemberParams {
  id: number;
  data: Partial<CreateMemberParams>;
}

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ id, data }: UpdateMemberParams) => {
      const response = await memberApi.updateMember(id, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  return {
    updateMember: mutateAsync,
    isUpdating: isPending,
    updateError: error || null,
  };
};

// Hook to delete member
export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (id: number) => {
      const response = await memberApi.deleteMember(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  return {
    deleteMember: mutateAsync,
    isDeleting: isPending,
    deleteError: error || null,
  };
};

// Hook to get available users
interface User {
  id: number;
  name: string;
  email: string;
}

export const useAvailableUsers = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['available-users'],
    queryFn: async () => {
      const response = await memberApi.getAvailableUsers();
      return response;
    },
  });

  return {
    users: data?.data,
    isLoadingUsers: isLoading,
    usersError: error || null,
    fetchUsers: refetch,
  };
};

// Hook to fetch schools
interface School {
  id: number;
  name: string;
}

export const useMemberSchools = (enabled: boolean = true) => {
  const { data, isLoading, error, refetch } = useQuery<School[], Error>({
    queryKey: ['member-schools'],
    queryFn: async () => {
      const response = await memberApi.getSchools();
      return response.data;
    },
    enabled, // Only fetch if enabled
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    schools: data,
    isLoadingSchools: isLoading,
    schoolsError: error || null,
    fetchSchools: refetch,
  };
};

// Hook to fetch eschools
interface Eschool {
  id: number;
  name: string;
  school_id: number;
}

export const useMemberEschools = (params?: { schoolId?: number; enabled?: boolean }) => {
  const { schoolId, enabled = true } = params || {};
  const { data, isLoading, error, refetch } = useQuery<Eschool[], Error>({
    queryKey: ['member-eschools', schoolId],
    queryFn: async () => {
      const response = await memberApi.getEschools(schoolId);
      return response.data;
    },
    enabled: enabled && !!schoolId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    eschools: data,
    isLoadingEschools: isLoading,
    eschoolsError: error || null,
    fetchEschools: refetch,
  };
};

// Combined hook for member management
interface UseMemberManagementParams extends UseMembersParams {
  userRole?: string;
}

export const useMemberManagement = (params?: UseMemberManagementParams) => {
  // Use all the individual hooks
  const { members, pagination, isLoadingMembers, membersError, fetchMembers } = useMembers(params);
  const { createMember, isCreating, createError } = useCreateMember();
  const { updateMember, isUpdating, updateError } = useUpdateMember();
  const { deleteMember, isDeleting, deleteError } = useDeleteMember();
  const { users, isLoadingUsers, usersError, fetchUsers } = useAvailableUsers();
  
  // Fetch schools and eschools - but disable the query for koordinator
  const shouldFetchSchoolData = params?.userRole === 'staff';
  
  // Call the hooks but they will be disabled when not needed
  const { schools, isLoadingSchools, schoolsError, fetchSchools } = useMemberSchools(shouldFetchSchoolData);
  const { eschools, isLoadingEschools, eschoolsError, fetchEschools } = useMemberEschools({ enabled: shouldFetchSchoolData });

  return {
    // Data
    members,
    users,
    schools,
    eschools,
    pagination,
    
    // Loading states
    isLoadingMembers,
    isLoadingUsers,
    isLoadingSchools,
    isLoadingEschools,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Errors
    membersError,
    usersError,
    schoolsError,
    eschoolsError,
    createError,
    updateError,
    deleteError,
    
    // Functions
    fetchMembers,
    fetchSchools,
    fetchEschools,
    fetchAvailableUsers: fetchUsers,
    createMember,
    updateMember,
    deleteMember,
  };
};