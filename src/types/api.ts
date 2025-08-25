export interface User {
  id: number;
  name: string;
  email: string;
  role: "siswa" | "bendahara" | "koordinator" | "staff";
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

// Auth-related interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  role: string;
  message: string;
  token: string;
  expires_in: number;
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
  description?: string;
  created_at: string;
  updated_at: string;
}
