import apiClient from "./client";

// Types
export interface PaymentPeriod {
  month: string;
  year: number;
  amount_paid: number;
  payment_count: number;
  percentage: number;
  payment_dates: string[];
}

export interface MemberPaymentStatistics {
  member_id: number;
  user_id: number;
  member_name: string;
  student_id?: string;
  grade_level?: string;
  monthly_fee: number;
  total_paid: number;
  percentage: number;
  periods: PaymentPeriod[];
}

export interface EschoolPaymentStatistics {
  eschool: {
    id: number;
    name: string;
    monthly_fee_amount: number;
  };
  members: MemberPaymentStatistics[];
}

export interface MemberPaymentDetails {
  member: {
    id: number;
    user_id: number;
    name: string;
    student_id?: string;
    grade_level?: string;
    eschool: {
      id: number;
      name: string;
      monthly_fee_amount: number;
    };
  };
  payment_summary: {
    total_paid: number;
    percentage: number;
    periods: PaymentPeriod[];
  };
}

export interface PeriodPayment {
  id: number;
  amount: number;
  is_paid: boolean;
  paid_date?: string;
  created_at: string;
  kas_record: {
    id: number;
    description: string;
    category: string;
  };
}

export interface MemberPeriodPayments {
  member: {
    id: number;
    name: string;
    eschool_name: string;
  };
  period: {
    month: string;
    year: number;
    monthly_fee: number;
    total_paid: number;
    percentage: number;
  };
  payments: PeriodPayment[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// API functions
export const paymentStatisticsApi = {
  /**
   * Get payment statistics for all members in an eschool
   */
  async getEschoolPaymentStatistics(
    eschoolId: number
  ): Promise<ApiResponse<EschoolPaymentStatistics>> {
    const response = await apiClient.get(
      `/eschools/${eschoolId}/payment-statistics`
    );
    return response.data;
  },

  /**
   * Get detailed payment history for a specific member
   */
  async getMemberPaymentDetails(
    memberId: number
  ): Promise<ApiResponse<MemberPaymentDetails>> {
    const response = await apiClient.get(
      `/members/${memberId}/payment-details`
    );
    return response.data;
  },

  /**
   * Get payment details for a specific member and period
   */
  async getMemberPeriodPayments(
    memberId: number,
    month: string,
    year: number
  ): Promise<ApiResponse<MemberPeriodPayments>> {
    const response = await apiClient.get(
      `/members/${memberId}/payments/${month}/${year}`
    );
    return response.data;
  },
};
