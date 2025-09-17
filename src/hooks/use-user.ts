// useUserManagement.ts - User management with TanStack Query based on Laravel backend
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser, CreateUserPayload } from "@/lib/api/user";
import { toast } from "sonner";

export const userQueryKeys = {
  all: ["users"] as const,
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserPayload) => createUser(userData),
    onSuccess: (data) => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      // Also invalidate eschools since new users might affect eschool assignments
      queryClient.invalidateQueries({ queryKey: ["eschools"] });
      toast.success("User created successfully");
    },
    onError: (error: any) => {
      console.error(
        "Failed to create user:",
        error?.response?.data?.message || error.message
      );
      toast.error("Failed to create user", {
        description:
          error?.response?.data?.message ||
          error.message ||
          "An unexpected error occurred",
      });
    },
  });
};