import apiClient from './client';

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

interface User {
  id: number;
  name: string;
  email: string;
}

interface School {
  id: number;
  name: string;
}

interface Eschool {
  id: number;
  name: string;
  school_id: number;
  coordinator_id: number;
  treasurer_id: number;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: Pagination;
}

// API functions
export const memberApi = {
  // Get members
  // Note: The backend automatically filters members by school for coordinators and staff
  // For coordinators: Only members from the same school as the coordinator's eschool
  // For staff: Only members from the staff's assigned school
  getMembers: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    sort_by?: string;
    sort_direction?: string;
    eschool_id?: number;
  }) => {
    try {
      const response = await apiClient.get<ApiResponse<Member[]>>('/members', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

  // Get members by eschool ID (for attendance and kas pages)
  getMembersByEschool: async (eschoolId: number) => {
    try {
      const response = await apiClient.get<ApiResponse<Member[]>>(`/members?eschool_id=${eschoolId}`);
      console.log(`THIS IS  ~ response:`, response)
      return response.data;
    } catch (error) {
      console.error(`Error fetching members for eschool ${eschoolId}:`, error);
      throw error;
    }
  },

  // Create member - Updated to handle both cases (new user or existing user)
  // For koordinator, eschool_ids is not required as it's automatically set
  createMember: async (data: {
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
  }) => {
    try {
      const response = await apiClient.post<ApiResponse<Member>>('/members', data);
      return response.data;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  },

  // Get member by ID
  getMember: async (id: number) => {
    try {
      const response = await apiClient.get<ApiResponse<Member>>(`/members/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching member ${id}:`, error);
      throw error;
    }
  },

  // Update member
  updateMember: async (
    id: number,
    data: Partial<{
      eschool_ids?: number[];
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
    }>
  ) => {
    try {
      const response = await apiClient.put<ApiResponse<Member>>(`/members/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating member ${id}:`, error);
      throw error;
    }
  },

  // Delete member
  deleteMember: async (id: number) => {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/members/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting member ${id}:`, error);
      throw error;
    }
  },

  // Get available users
  getAvailableUsers: async () => {
    try {
      const response = await apiClient.get<ApiResponse<User[]>>('/members/users/available');
      return response.data;
    } catch (error) {
      console.error('Error fetching available users:', error);
      throw error;
    }
  },

  // Get schools
  getSchools: async () => {
    try {
      const response = await apiClient.get<ApiResponse<School[]>>('/members/schools');
      return response.data;
    } catch (error) {
      console.error('Error fetching schools:', error);
      throw error;
    }
  },

  // Get eschools
  getEschools: async (schoolId?: number) => {
    try {
      const params = schoolId ? { school_id: schoolId } : {};
      const response = await apiClient.get<ApiResponse<Eschool[]>>('/members/eschools', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching eschools:', error);
      throw error;
    }
  },
};

export default memberApi;