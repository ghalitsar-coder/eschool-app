// useAuth with TanStack Query integration
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";

// useAuth.ts - Authentication hook with Zustand
import { useAuthStore } from "@/lib/stores/auth";
import { ApiResponse, LoginResponse } from "@/types/api";

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
    onSuccess: (response: ApiResponse<LoginResponse>) => {
      login(response.data.user); // Type assertion for now

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

export const useCurrentUser = () => {
  const { isAuthenticated, setUser, logout } = useAuthStore();

  return useQuery({
    queryKey: authQueryKeys.user,
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
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
    onSuccess: (data: LoginResponse) => {
      setUser(data.user);

      // Invalidate queries to refetch with new token
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.profile,
      });
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user });
    },
    onError: () => {
      logout();
      queryClient.clear();
    },
  });
};

// Hook to access authentication state and actions
export const useAuth = () => {
  const { user, isAuthenticated, login, logout, updateUser, setUser, setToken } =
    useAuthStore();

  // Check if user has a specific role
  const hasRole = (role: string) => {
    return user?.roles?.some((userRole) => userRole.role === role) || false;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: string[]) => {
    return user?.roles?.some((userRole) => roles.includes(userRole.role)) || false;
  };

  // Get user's eschool ID for a specific role
  const getEschoolIdForRole = (role: string) => {
    const userRole = user?.roles?.find((userRole) => userRole.role === role);
    return userRole ? userRole.eschool_id : null;
  };

  // Get all eschool IDs for user's roles
  const getAllEschoolIds = () => {
    return user?.roles?.map((userRole) => userRole.eschool_id) || [];
  };

  // Check if user is a staff member
  const isStaff = hasRole("supervisor");

  // Check if user is a coordinator
  const isKoordinator = hasRole("coordinator");

  // Check if user is a treasurer
  const isBendahara = hasRole("treasurer");

  // Check if user is a regular member
  const isMember = hasRole("member");

  const treasurerEschoolId =  user?.roles.find(data => data.role == "treasurer")?.eschool_id

  return {
    // User data
    user,
    isAuthenticated,

    // Role checks
    hasRole,
    hasAnyRole,
    isStaff,
    isKoordinator,
    isBendahara,
    isMember,
    treasurerEschoolId,  
    getEschoolIdForRole,
    getAllEschoolIds,
    // Actions
    login,
    logout,
    updateUser,
    setUser,
    setToken,
  };
};