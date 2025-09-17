// useMemberProfileData.ts - Hooks for member profile data with TanStack Query
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import apiClient from "@/lib/api/client";

// Query keys for better cache management
export const memberProfileQueryKeys = {
  all: ["member-profile"] as const,
  profile: () => [...memberProfileQueryKeys.all, "profile"] as const,
  attendance: (page?: number, perPage?: number, date?: string) =>
    [...memberProfileQueryKeys.all, "attendance", page, perPage, date] as const,
  kas: (
    page?: number,
    perPage?: number,
    startDate?: string,
    endDate?: string
  ) =>
    [
      ...memberProfileQueryKeys.all,
      "kas",
      page,
      perPage,
      startDate,
      endDate,
    ] as const,
};

// Hook untuk mengambil data profile member
export const useMemberProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: memberProfileQueryKeys.profile(),
    queryFn: async () => {
      const response = await apiClient.get("/member/profile");
      return response.data;
    },
    enabled: true,
  });
};

// Hook untuk mengambil data attendance dengan filter
// Hook untuk mengambil data attendance member
export const useMemberAttendance = (params?: {
  page?: number;
  perPage?: number;
  date?: string;
}) => {
  const { user } = useAuth();
  const { page = 1, perPage = 10, date } = params || {};

  return useQuery({
    queryKey: memberProfileQueryKeys.attendance(page, perPage, date),
    queryFn: async () => {
      const queryParams: { page: number; per_page: number; date?: string } = {
        page,
        per_page: perPage,
      };
      if (date) {
        queryParams.date = date;
      }
      const response = await apiClient.get("/member/attendance", {
        params: queryParams,
      });
      return response.data;
    },
    enabled: !!user && ["siswa", "koordinator", "staff"].includes(user.role),
  });
};

// Hook untuk mengambil data kas dengan filter
// Hook untuk mengambil data kas member
export const useMemberKas = (params?: {
  page?: number;
  perPage?: number;
  startDate?: string;
  endDate?: string;
}) => {
  const { user } = useAuth();
  const { page = 1, perPage = 10, startDate, endDate } = params || {};

  return useQuery({
    queryKey: memberProfileQueryKeys.kas(page, perPage, startDate, endDate),
    queryFn: async () => {
      const queryParams: {
        page: number;
        per_page: number;
        start_date?: string;
        end_date?: string;
      } = { page, per_page: perPage };
      if (startDate) {
        queryParams.start_date = startDate;
      }
      if (endDate) {
        queryParams.end_date = endDate;
      }
      const response = await apiClient.get("/member/kas", {
        params: queryParams,
      });
      return response.data;
    },
    enabled: !!user && ["siswa", "koordinator", "staff"].includes(user.role),
  });
};

// Hook untuk export attendance data
export const useExportAttendance = () => {
  const exportAttendance = async (eschoolId?: number) => {
    try {
      const params: { eschool_id?: number } = {};
      if (eschoolId) {
        params.eschool_id = eschoolId;
      }

      const response = await apiClient.get("/member/attendance/export", {
        params,
        responseType: "blob",
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "attendance-export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();

      return { success: true };
    } catch (error: any) {
      console.error("Export failed:", error);
      return { success: false, error };
    }
  };

  return { exportAttendance };
};

// Hook untuk export kas data
export const useExportKas = () => {
  const exportKas = async (eschoolId?: number) => {
    try {
      const params: { eschool_id?: number } = {};
      if (eschoolId) {
        params.eschool_id = eschoolId;
      }

      const response = await apiClient.get("/member/kas/export", {
        params,
        responseType: "blob",
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "kas-export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();

      return { success: true };
    } catch (error: any) {
      console.error("Export failed:", error);
      return { success: false, error };
    }
  };

  return { exportKas };
};

// Main hook yang menggabungkan semua data profile member
export const useMemberProfileData = () => {
  const profile = useMemberProfile();
  console.log(`THIS IS  ~ profile:`, profile.data);
    const transformProfileData = {
      ...profile.data,
      eschools: profile?.data?.eschools?.map((eschool) => {
        let days = [];
  
        try {
          // Coba parse sebagai JSON
          const parsed = JSON.parse(eschool.schedule_days);
          if (Array.isArray(parsed)) {
            days = parsed; // sukses, gunakan hasil parse
          } else {
            // bukan array, fallback ke split
            days = eschool.schedule_days.split(",").map(day => day.trim());
          }
        } catch (e) {
          // gagal parse → bukan JSON, anggap string biasa dipisah koma
          days = eschool.schedule_days.split(",").map(day => day.trim());
        }
  
        return {
          ...eschool,
          schedule_days: days,
        };
      }) || [], // fallback ke array kosong jika undefined
    };
  
    // Jangan lupa assign atau return transformProfileData
    // karena sekarang hanya didefinisikan, tapi tidak dipakai/dikembalikan

  return {
    // Data
    profileData: transformProfileData,

    // Loading states
    isLoadingProfile: profile.isLoading,

    // Error states
    profileError: profile.error,

    // Refetch functions
    refetchProfile: profile.refetch,
  };
};
