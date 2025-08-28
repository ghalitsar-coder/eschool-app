import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth';
import apiClient from '@/lib/api/client';

interface AttendanceStats {
  today: { present: number; total: number; percentage: number };
  week: { present: number; total: number; percentage: number };
  month: { present: number; total: number; percentage: number };
  total_members: number;
}

export const useAttendanceStatistics = (eschoolId: string) => {
  const { token } = useAuthStore();

  return useQuery<AttendanceStats, Error>({
    queryKey: ['attendance-statistics', eschoolId],
    queryFn: async () => {
      const response = await apiClient.get(`/attendance/statistics?eschool_id=${eschoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!eschoolId && !!token,
  });
};