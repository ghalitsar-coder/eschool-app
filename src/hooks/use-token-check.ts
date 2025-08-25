import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/stores/auth";
import { authApi } from "@/lib/api/auth";

export const useTokenCheck = () => {
  const { isAuthenticated, setUser, logout } = useAuthStore();

  const checkTokenStatus = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      // Check if token exists in cookies
      const tokenExists = document.cookie
        .split(";")
        .some((cookie) => cookie.trim().startsWith("token="));

      const refreshTokenExists = document.cookie
        .split(";")
        .some((cookie) => cookie.trim().startsWith("refresh_token="));

      console.log("Token check:", { tokenExists, refreshTokenExists });

      // If no token but refresh token exists, try to refresh
      if (!tokenExists && refreshTokenExists) {
        console.log("Attempting to refresh token...");
        const response = await authApi.refresh();

        if (response.data) {
          console.log("Token refreshed successfully");
          setUser(response.data.user);
          return true;
        } else {
          console.log("Token refresh failed");
          logout();
          return false;
        }
      }

      // If no tokens at all, logout
      if (!tokenExists && !refreshTokenExists) {
        console.log("No tokens found, logging out");
        logout();
        return false;
      }

      return tokenExists;
    } catch (error) {
      console.error("Error checking token status:", error);
      logout();
      return false;
    }
  }, [isAuthenticated, setUser, logout]);

  // Check token on mount and when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      checkTokenStatus();
    }
  }, [isAuthenticated, checkTokenStatus]);

  return { checkTokenStatus };
};
