import { useMutation, useQuery } from '@tanstack/react-query';
import attendanceApi from '@/lib/api/attendance';
import { AttendanceFormData, AttendanceRecord, AttendanceStats, CreateAttendanceParams } from '@/types/api';
import { useAuth } from './use-auth';


export const useAttendance = (params: {
    date?: Date;
    start_date?: Date;
    page?: Date;
  }) => {
    const {user,isLoadingUser } = useAuth()
    console.log(`🚀 ~ use-attendance.ts:13 ~ isLoadingUser:`, isLoadingUser)


  //  if (!user && !isLoadingUser) {
  //   throw new Error("Tidak ada user!")
  //  }
  const payload=  { ...params , eschoolId:user?.eschool_id}

  return useQuery<AttendanceRecord[], Error>({
    queryKey: ['attendance', user?.eschool_id],
    queryFn: async () => {
      const response = await attendanceApi.getAttendanceRecords(payload);
      console.log(`🚀 ~ use-attendance.ts:25 ~ response:`, response)

      return response;
    },
    enabled: !!user?.eschool_id ,
  });
};





export const useAttendanceStatistics = () => {
  const {user} = useAuth()
  

  return useQuery<AttendanceStats, Error>({
    queryKey: ['attendance-statistics', user?.eschool_id],
    queryFn: async () => {
      const response = await attendanceApi.getAttendanceStatistics(user?.eschool_id);
      return response;
    },
    enabled:  !!user?.eschool_id ,
  });
};


export const useCreateAttendance = () => {
  const {user,isLoadingUser} = useAuth()
  

  // if (!user && !isLoadingUser) {
  //   throw new Error("User Not found")
  // }
 
  return useMutation({
    mutationFn: async (data :AttendanceFormData) => {
      const response = await attendanceApi.recordAttendance({ eschool_id: user?.eschool_id, ...data });
      return response
    },
    
  });
};

export const useAttendanceManagement = () => {
 const  createAttendance = useCreateAttendance()
 const  getAttendances = useAttendance({})
 const  getAttendanceStatistics= useAttendanceStatistics
  
};
