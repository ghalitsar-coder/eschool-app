import { FormMessage } from '@/components/ui/form';
export interface User {
     id: number;
      name: string;
      email: string;
      role: "siswa" | "bendahara" | "koordinator" | "staff";
      eschool_id:number;
}

// Auth-related interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
      id: number;
      name: string;
      email: string;
      role: "siswa" | "bendahara" | "koordinator" | "staff";
      eschool_id:number;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface KasRecord {
  id: number;
  eschool_id: number;
  recorder_id: number;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
  payments?: KasPayment[];
  recorder?: User;
}

export interface KasPayment {
  id: number;
  member_id: number;
  kas_record_id: number;
  amount: number;
  month: number;
  year: number;
  is_paid: boolean;
  paid_date?: string;
  created_at: string;
  updated_at: string;
  member?: Member;
}

export interface KasSummary {
  eschool: {
    name: string;
    monthly_kas_amount: number;
  };
  summary: {
    total_income: number;
    total_expense: number;
    balance: number;
    total_members: number;
  };
  current_month: {
    month: number;
    year: number;
    paid_count: number;
    unpaid_count: number;
    payment_percentage: number;
  };
}

export interface Member {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  school_id: number;
  eschool_id: number;
  created_at: string;
  updated_at: string;
  school?: School;
  eschool?: Eschool;
}

export interface School {
  id: number;
  name: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Eschool {
  id: number;
  name: string;
  school_id:number;
coordinator_id:number;
treasurer_id:number;
  description?: string;
  monthly_kas_amount:number;
  schedule_days: Array<string>;
total_schedule_days :number;
is_active:boolean;
  created_at: string;
  updated_at: string;
}



  // export interface AttendanceRecord {
  //   id: string;
  //   member_id: string;
  //   date: string;
  //   is_present: boolean;
  //   notes: string | null;
  //   member_name?: string;
  // }
export interface AttendanceStats {
  today: { present: number; total: number; percentage: number };
  week: { present: number; total: number; percentage: number };
  month: { present: number; total: number; percentage: number };
  total_members: number;
}



export interface AttendanceFormData {
  eschool_id: string;
  date: string;
  members: {
    member_id: string;
    is_present: boolean;
    notes: string | null;
  }[];
}

export interface CreateAttendanceParams {
  eschool_id?: number;
  members: AttendanceFormData;
}export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Member {
  id: number;
  student_id?: string | null;
  phone?: string | null;
  user: User;
}

export interface Recorder {
  id: number;
  name: string;
  email: string;
}

export interface AttendanceRecord {
  id: number;
  date: string;
  is_present: boolean;
  notes?: string | null;
  member: Member;
  recorder: Recorder;
}

export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface AttendanceResponse {
  data: AttendanceRecord[];
  links: PaginationLinks;
  meta: PaginationMeta;
  success: boolean;
  message: string;
}
