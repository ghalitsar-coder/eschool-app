export interface User {
  id: number;
  name: string;
  email: string;
  role: "siswa" | "bendahara" | "koordinator" | "staff";
  eschool_id: number;
  school_id?: number;
}

export interface Eschool {
  id: number;
  name: string;
  description: string | null;
  school_id: number;
  coordinator_id: number | null;
  treasurer_id: number | null;
  monthly_kas_amount: number | null;
  schedule_days: string[] | null;
  total_schedule_days: number | null;
  is_active: boolean;
  members_count: number;
  coordinator?: User;
  treasurer?: User;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: number;
  name: string;
  student_id: string;
  user_id: number | null;
  school_id: number;
  is_active: boolean;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}