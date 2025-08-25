// useAuth with TanStack Query integration
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoginRequest, RegisterRequest, User } from "../types/api";
import { useCallback } from "react";
import { useAuthStore } from "@/lib/stores/auth";
import { authApi } from "@/lib/api/auth";
import apiClient from "@/lib/api/client";
import { useTokenCheck } from "./use-token-check";

// Query keys for better cache management
export const authQueryKeys = {
  profile: ["auth", "profile"] as const,
  user: ["auth", "user"] as const,
};

export const useLogin = () => {
  const { login } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {

      // Handle response structure: { data: { user: {...}, role: "..." }, message: "..." }
      // Token is sent via cookies, not in response body
      if (data.data && data.data.user) {
        const userData = {
          ...data.data.user,
          role: data.data.role || data.data.user.role,
        };

        login(userData as any); // Type assertion for now

        // Store in localStorage (token will be read from cookies by API client)
        const authStorage = {
          state: {
            user: userData,
            isAuthenticated: true,
            token: null, // Token is in cookies, not localStorage
          },
        };
        localStorage.setItem("auth-storage", JSON.stringify(authStorage));
      } else {
        throw new Error(data.message || "Invalid login response");
      }

      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.profile,
      });
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user });
    },
    onError: (error: Error) => {
      console.error("Login gagal:", error.message);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      if (data.data) {
        console.log("Registrasi berhasil. Silakan login.");
      } else {
        throw new Error(data.message || "Registrasi gagal");
      }
    },
    onError: (error: Error) => {
      console.error("Registrasi gagal:", error.message);
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout();
      // Clear all cached data on logout
      queryClient.clear();
    },
    onError: (error: Error) => {
      // Even if API call fails, clear local state
      logout();
      queryClient.clear();
      console.error("Logout error:", error.message);
    },
  });
};

export const useProfile = () => {
  const { user, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: authQueryKeys.profile,
    queryFn: authApi.getProfile,
    enabled: !!user && isAuthenticated,
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });
};

export const useCurrentUser = () => {
  const { isAuthenticated, setUser, logout } = useAuthStore();

  return useQuery({
    queryKey: authQueryKeys.user,
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) {
        logout(); // Clear auth state on 401
        return false;
      }
      return failureCount < 3;
    },
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user);
      }
    },
    onError: () => {
      logout(); // Clear auth state on error
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: (data) => {
      if (data.data) {
        console.log("Password berhasil diubah");
      } else {
        throw new Error(data.message || "Gagal mengubah password");
      }
    },
    onError: (error: Error) => {
      console.error("Gagal mengubah password:", error.message);
    },
  });
};

export const useRefreshToken = () => {
  const { setUser, logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.refresh,
    onSuccess: (data) => {
      console.log("Refresh token response:", data);
      if (data.data && data.data.user) {
        const userData = {
          ...data.data.user,
          role: data.data.role || data.data.user.role,
        };

        console.log("Updating user data from refresh:", userData);
        setUser(userData as unknown);

        // Update localStorage (token is in cookies)
        const authStorage = {
          state: {
            user: userData,
            isAuthenticated: true,
            token: null, // Token is in cookies
          },
        };
        localStorage.setItem("auth-storage", JSON.stringify(authStorage));

        // Invalidate queries to refetch with new token
        queryClient.invalidateQueries({
          queryKey: authQueryKeys.profile,
        });
        queryClient.invalidateQueries({ queryKey: authQueryKeys.user });
      } else {
        throw new Error(data.message || "Token refresh failed");
      }
    },
    onError: () => {
      logout();
      queryClient.clear();
    },
  });
};

// Main useAuth hook that combines everything
export const useAuth = () => {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Initialize auth state on mount
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();

  // Debug logging
 

  // Token check functionality

  // Helper method for making authenticated API requests
  const apiRequest = useCallback(
    async <T>(endpoint: string, options: unknown = {}): Promise<T> => {
      try {
        const response = await apiClient.request<T>({
          url: endpoint,
          ...options,
        });
        return response.data;
      } catch (error) {
        // Error handling is already done in axios interceptor
        throw error;
      }
    },
    []
  );

  // Role checking helpers
  const hasRole = useCallback(
    (role: string) => {
      return user?.role === role;
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles: string[]) => {
      return user?.role ? roles.includes(user.role) : false;
    },
    [user]
  );

  return {
    // State
    user,
    isAuthenticated,
    isLoadingUser,

    // Mutations
    loginMutation: useLogin(),
    registerMutation: useRegister(),
    logoutMutation: useLogout(),
    changePasswordMutation: useChangePassword(),
    refreshTokenMutation: useRefreshToken(),

    // Queries
    profileQuery: useProfile(),

    // Actions
    updateUser,

    // API helper
    apiRequest,

    // Role helpers
    hasRole,
    hasAnyRole,

    // Role shortcuts
    isSiswa: hasRole("siswa"),
    isBendahara: hasRole("bendahara"),
    isKoordinator: hasRole("koordinator"),
    isStaff: hasRole("staff"),

    // Query client for manual cache management
    queryClient,
  };
};
