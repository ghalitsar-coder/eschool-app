import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth';
import { memberApi } from '@/lib/api/members';

interface Member {
  id: string;
  name: string;
  student_id?: string;
  is_attended: boolean;
}

interface MembersResponse {
  members: Member[];
}

export const useMembersAvailable = (eschool_id: number, date?: string) => {
  const { token } = useAuthStore();

  return useQuery<MembersResponse, Error>({
    queryKey: ['members', eschool_id, date],
    queryFn: async () => {
      const response = await memberApi.getMembersAvailable({eschool_id,date});
      

      return response;
    },
    enabled: !!eschool_id && !!date,
  });
};