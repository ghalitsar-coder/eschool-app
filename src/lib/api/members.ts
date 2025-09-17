import apiClient from "./client";

export interface Member {
  id: number;
  school_id: number;
  user_id: number;
  nip: string;
  name: string;
  date_of_birth: string;
  gender: string;
  address: string;
  status: string;
  student_id: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    role: string;
    school_id: number;
    created_at: string;
    updated_at: string;
  };
  school: {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
  eschools: Array<{
    id: number;
    school_id: number;
    coordinator_id: number;
    treasurer_id: number;
    name: string;
    description: string;
    monthly_kas_amount: number;
    schedule_days: string;
    total_schedule_days: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    pivot: {
      member_id: number;
      eschool_id: number;
    };
  }>;
}

export interface MembersApiResponse {
  success: boolean;
  data: Member[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message: string;
}

export interface MembersResponse {
  eschool: {
    id: number;
    name: string;
    monthly_kas_amount: number;
  };
  members: {
    id: number;
    student_id: string;
    name: string;
    email: string;
    phone?: string;
  }[];
}

export const memberApi = {
  // Get members for current treasurer's eschool
  getMembers: async (eschoolId:number): Promise<MembersApiResponse> => {
    
    try {
      const response = await apiClient.get("/members", {
        params:{
          eschool_id:eschoolId
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching members:", error);
      throw error;
    }
  },
  getMembersAvailable: async (params:{eschool_id:number , date? : string}): Promise<MembersResponse> => {
    try {
      const response = await apiClient.get("/attendance/members/available", {
        params 
      });
      
      return response.data;
    } catch (error) {
      console.error("Error fetching members:", error);
      throw error;
    }
  },
}