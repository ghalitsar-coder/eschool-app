// User interfaces
export interface User {
  id: number;
  name: string;
  email: string;
  role: "siswa" | "bendahara" | "koordinator" | "staff";
  eschool_id: number;
}

// Auth-related interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// API response interfaces
export interface ApiResponse<T = unknown> {
  success: boolean;
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

// Kas interfaces
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

// Member interfaces
export interface Member {
  id: number;
  student_id?: string | null;
  phone?: string | null;
  name: string;
  email: string;
}

// School interfaces
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
  school_id: number;
  coordinator_id: number;
  treasurer_id: number;
  description?: string;
  monthly_kas_amount: number;
  schedule_days: Array<string>;
  total_schedule_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Attendance interfaces
export interface AttendanceStats {
  today: { present: number; total: number; percentage: number };
  week: { present: number; total: number; percentage: number };
  month: { present: number; total: number; percentage: number };
  total_members: number;
}

export interface AttendanceFormData {
  eschool_id: number;
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
}

export interface UpdateAttendanceParams {
  id: number;
  data: any;
}

export interface AttendanceRecord {
  id: number;
  date: string;
  is_present: boolean;
  notes?: string | null;
  member: Member;
  recorder: User;
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