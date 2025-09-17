import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { paymentStatisticsApi } from "@/lib/api/payment-statistics";

// Query keys for payment statistics
export const paymentStatisticsQueryKeys = {
  eschoolStatistics: ["payment-statistics", "eschool"] as const,
  memberDetails: ["payment-statistics", "member-details"] as const,
  memberPeriodPayments: [
    "payment-statistics",
    "member-period-payments",
  ] as const,
};

// Types for payment statistics
export interface PaymentPeriod {
  month: string;
  year: number;
  amount_paid: number;
  payment_count: number;
  percentage: number;
  payment_dates: string[];
  monthly_fee: number;
  remaining_amount: number;
}

export interface MemberPaymentStatistics {
  member_id: number;
  user_id: number;
  member_name: string;
  student_id?: string;
  grade_level?: string;
  monthly_fee: number;
  total_paid: number;
  total_months_paid: number;
  average_percentage: number;
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

/**
 * Hook to get payment statistics for all members in an eschool
 */
export const useEschoolPaymentStatistics = (eschoolId?: number) => {
  const { treasurerEschoolId, getEschoolIdForRole } = useAuth();
  const coordinatorId = getEschoolIdForRole("coordinator");
  const finalEschoolId =  treasurerEschoolId || coordinatorId;
;

  return useQuery({
    queryKey: [...paymentStatisticsQueryKeys.eschoolStatistics, finalEschoolId],
    queryFn: async () => {
      if (!finalEschoolId) throw new Error("Eschool ID is required");
      const response = await paymentStatisticsApi.getEschoolPaymentStatistics(
        finalEschoolId
      );
      return response;
    },
    enabled: !!finalEschoolId,
  });
};

/**
 * Hook to get detailed payment history for a specific member
 */
export const useMemberPaymentDetails = (memberId?: number) => {
  return useQuery({
    queryKey: [...paymentStatisticsQueryKeys.memberDetails, memberId],
    queryFn: async () => {
      if (!memberId) throw new Error("Member ID is required");
      const response = await paymentStatisticsApi.getMemberPaymentDetails(
        memberId
      );
      return response;
    },
    enabled: !!memberId,
  });
};

/**
 * Hook to get payment details for a specific member and period
 */
export const useMemberPeriodPayments = (
  memberId?: number,
  month?: string,
  year?: number
) => {
  return useQuery({
    queryKey: [
      ...paymentStatisticsQueryKeys.memberPeriodPayments,
      memberId,
      month,
      year,
    ],
    queryFn: async () => {
      if (!memberId || !month || !year) {
        throw new Error("Member ID, month, and year are required");
      }
      const response = await paymentStatisticsApi.getMemberPeriodPayments(
        memberId,
        month,
        year
      );
      return response;
    },
    enabled: !!(memberId && month && year),
  });
};

/**
 * Main hook that combines payment statistics functionality
 */
export const usePaymentStatistics = (eschoolId?: number) => {
  const eschoolStatsQuery = useEschoolPaymentStatistics(eschoolId);
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: paymentStatisticsQueryKeys.eschoolStatistics,
    });
    queryClient.invalidateQueries({
      queryKey: paymentStatisticsQueryKeys.memberDetails,
    });
    queryClient.invalidateQueries({
      queryKey: paymentStatisticsQueryKeys.memberPeriodPayments,
    });
  };

  return {
    // Data
    eschoolStatistics: eschoolStatsQuery.data?.data as
      | EschoolPaymentStatistics
      | undefined,
    members: eschoolStatsQuery.data?.data?.members || [],
    eschool: eschoolStatsQuery.data?.data?.eschool,

    // Loading states
    isLoading: eschoolStatsQuery.isLoading,
    isError: eschoolStatsQuery.isError,

    // Error states
    error: eschoolStatsQuery.error,

    // Actions
    refetch: eschoolStatsQuery.refetch,
    invalidateAll,

    // Query object for advanced usage
    eschoolStatsQuery,
  };
};
