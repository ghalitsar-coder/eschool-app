import { useQuery } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import koordinatorDashboardApi from '@/lib/api/koordinator-dashboard';

// Types for koordinator dashboard
interface UserContext {
  id: number;
  name: string;
  role_in_eschool: string;
  permissions: string[];
}

interface EschoolInfo {
  id: number;
  name: string;
  description: string;
  school_id: number;
  monthly_kas_amount: number;
  schedule_days: string[];
  total_schedule_days: number;
}

interface Statistics {
  total_members: number;
  active_members: number;
  role_breakdown: {
    koordinator: number;
    bendahara: number;
    member: number;
  };
  attendance_rate: number;
  total_sessions: number;
  present_sessions: number;
  kas_collection_rate: number;
  total_kas_expected: number;
  total_kas_collected: number;
  outstanding_kas: number;
}

interface RecentAttendance {
  id: number;
  date: string;
  user_id: number;
  member_name: string;
  role_in_eschool: string;
  is_present: boolean;
  recorded_by: {
    id: number;
    name: string;
    role_in_eschool: string;
  };
}

interface RecentPayment {
  user_id: number;
  member_name: string;
  role_in_eschool: string;
  amount: number;
  paid_date: string;
  approved_by: string;
}

interface UserWithMultipleRoles {
  user_id: number;
  name: string;
  roles_in_school: Array<{
    eschool_id: number;
    role: string;
  }>;
}

interface MultiRoleInsights {
  users_with_multiple_roles: UserWithMultipleRoles[];
  cross_participation_rate: number;
}

interface RecentActivities {
  recent_attendance: RecentAttendance[];
  recent_payments: RecentPayment[];
}

interface KoordinatorDashboardData {
  user_context: UserContext;
  eschool: EschoolInfo;
  statistics: Statistics;
  recent_activities: RecentActivities;
  multi_role_insights: MultiRoleInsights;
}

// Hook to fetch koordinator dashboard data
export const useKoordinatorDashboard = () => {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['koordinator-dashboard', user?.eschool_id],
    queryFn: async () => {
      if (!user?.eschool_id) {
        throw new Error("No eschool ID found");
      }
      const response = await koordinatorDashboardApi.getDashboard(user.eschool_id);
      return response.data;
    },
    enabled: !!user?.eschool_id && user?.role === 'koordinator',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  return {
    dashboardData: data,
    isLoadingDashboard: isLoading,
    dashboardError: error || null,
    refetchDashboard: refetch,
  };
};
