"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/lib/stores/auth";
import { authApi } from "@/lib/api/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, setUser, logout, isAuthenticated } = useAuthStore();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Function to check and refresh token
  const checkAndRefreshToken = useCallback(async () => {
    if (isRefreshingRef.current) return;

    try {
      isRefreshingRef.current = true;

      // With httpOnly cookies, we can't check if refresh token exists
      // Just attempt to refresh - if it fails, we'll logout

      // Try to refresh token
      const response = await authApi.refresh();

      if (response.data && response.data.user) {
        console.log("Token refreshed successfully");
        const userData = {
          ...response.data.user,
          role: response.data.role || response.data.user.role,
        };
        setUser(userData as unknown);
      } else {
        console.log("Token refresh failed, logging out");
        logout();
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      logout();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [logout, setUser]);

  // With httpOnly cookies, we can't check if token exists in cookies
  // We'll rely on API responses to determine if authentication is valid

  // Setup automatic token refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    // Set up interval for periodic token refresh (every 5 minutes)
    // This ensures tokens stay fresh
    refreshIntervalRef.current = setInterval(() => {
      if (isAuthenticated) {
        console.log("Periodic token refresh check");
        checkAndRefreshToken();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isAuthenticated, checkAndRefreshToken]);

  // Handle visibility change (when user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isAuthenticated) {
        // When user comes back to tab, refresh token to ensure it's still valid
        console.log("Tab focused, refreshing token");
        checkAndRefreshToken();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, checkAndRefreshToken]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return <>{children}</>;
}
