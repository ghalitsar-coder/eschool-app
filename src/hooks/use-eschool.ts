// useEschoolManagement.ts - Eschool management with TanStack Query based on Laravel backend
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eschool, User } from "@/types/api";
import { useAuth } from "./use-auth";
import { 
  fetchEschools, 
  createEschool, 
  updateEschool, 
  deleteEschool 
} from "@/lib/api/eschool";
import { getEligibleTreasurers } from "@/lib/api/eschool-users";
import { toast } from "sonner";

// Query keys for better cache management
export const eschoolQueryKeys = {
  all: ["eschools"] as const,
  lists: () => [...eschoolQueryKeys.all, "list"] as const,
  list: (filters: any) => [...eschoolQueryKeys.lists(), filters] as const,
  users: {
    treasurers: (schoolId?: number) => ["eschools", "users", "treasurers", schoolId] as const,
  },
};

// Helper function to ensure schedule_days is always an array
const normalizeEschool = (eschool: Eschool): Eschool => {
  return {
    ...eschool,
    schedule_days: Array.isArray(eschool.schedule_days) ? eschool.schedule_days : [],
  };
};

// Helper function to normalize array of eschools
const normalizeEschools = (eschools: Eschool[]): Eschool[] => {
  return eschools.map(normalizeEschool);
};

export const useEschools = () => {
  return useQuery({
    queryKey: eschoolQueryKeys.list({}),
    queryFn: async () => {
      const eschools = await fetchEschools();
      return normalizeEschools(eschools);
    },
    enabled: true,
  });
};

export const useCreateEschool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEschool,
    onSuccess: (data) => {
      // Normalize the returned data
      const normalizedData = normalizeEschool(data);
      
      // Invalidate and refetch eschool-related queries
      queryClient.invalidateQueries({ queryKey: eschoolQueryKeys.all });
      toast.success("Eschool created successfully");
    },
    onError: (error: any) => {
      console.error(
        "Failed to create eschool:",
        error?.response?.data?.message || error.message
      );
      toast.error("Failed to create eschool", {
        description: error?.response?.data?.message || error.message || "An unexpected error occurred",
      });
    },
  });
};

export const useUpdateEschool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEschool,
    onSuccess: (data) => {
      // Normalize the returned data
      const normalizedData = normalizeEschool(data);
      
      // Invalidate and refetch eschool-related queries
      queryClient.invalidateQueries({ queryKey: eschoolQueryKeys.all });
      toast.success("Eschool updated successfully");
    },
    onError: (error: any) => {
      console.error(
        "Failed to update eschool:",
        error?.response?.data?.message || error.message
      );
      toast.error("Failed to update eschool", {
        description: error?.response?.data?.message || error.message || "An unexpected error occurred",
      });
    },
  });
};

export const useDeleteEschool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEschool,
    onSuccess: (data) => {
      // Invalidate and refetch eschool-related queries
      queryClient.invalidateQueries({ queryKey: eschoolQueryKeys.all });
      toast.success("Eschool deleted successfully");
    },
    onError: (error: any) => {
      console.error(
        "Failed to delete eschool:",
        error?.response?.data?.message || error.message
      );
      toast.error("Failed to delete eschool", {
        description: error?.response?.data?.message || error.message || "An unexpected error occurred",
      });
    },
  });
};

export const useEligibleTreasurers = (schoolId?: number) => {
  const { user } = useAuth();
  const finalSchoolId = schoolId || user?.school_id;

  return useQuery({
    queryKey: eschoolQueryKeys.users.treasurers(finalSchoolId),
    queryFn: () => getEligibleTreasurers(finalSchoolId),
    enabled: !!finalSchoolId,
  });
};

// Main hook that combines all eschool management functionality
export const useEschoolManagement = () => {
  const eschoolsQuery = useEschools();
  const createEschoolMutation = useCreateEschool();
  const updateEschoolMutation = useUpdateEschool();
  const deleteEschoolMutation = useDeleteEschool();

  return {
    // Queries data
    eschools: eschoolsQuery.data || [],

    // Loading states
    isLoadingEschools: eschoolsQuery.isLoading,
    isCreatingEschool: createEschoolMutation.isPending,
    isUpdatingEschool: updateEschoolMutation.isPending,
    isDeletingEschool: deleteEschoolMutation.isPending,

    // Error states
    eschoolsError: eschoolsQuery.error,
    createEschoolError: createEschoolMutation.error,
    updateEschoolError: updateEschoolMutation.error,
    deleteEschoolError: deleteEschoolMutation.error,

    // Actions
    createEschool: createEschoolMutation.mutate,
    updateEschool: updateEschoolMutation.mutate,
    deleteEschool: deleteEschoolMutation.mutate,

    // Refetch functions
    refetchEschools: eschoolsQuery.refetch,

    // Query objects for advanced usage
    eschoolsQuery,
    createEschoolMutation,
    updateEschoolMutation,
    deleteEschoolMutation,
  };
};