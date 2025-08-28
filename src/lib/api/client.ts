// client.ts - Axios client with JWT refresh token implementation
import axios, { AxiosResponse } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest", // Important for Laravel
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Debug logging
  

    // With httpOnly cookies, we don't need to manually add Authorization header
    // The browser will automatically send the cookies with each request
    // Just log that we're making a request
  
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Flag to prevent multiple refresh attempts
let isRefreshing = false;

type FailedQueueItem = {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
};

let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor with automatic token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
 

    // Check if this is a logout response
    if (response.config.url?.includes("/logout") && response.status === 200) {
      if (typeof window !== "undefined") {
        // Clear auth storage and redirect
        localStorage.removeItem("auth-storage");
        window.location.href = "/login";
      }
    }
    return response;
  },
  async (error: unknown) => {
    const originalRequest = error.config;

    // Skip refresh for refresh endpoint itself to prevent infinite loop
    if (originalRequest.url?.includes("/refresh")) {
      return Promise.reject(error);
    }

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // With httpOnly cookies, we can't check if refresh token exists
        // Just attempt to refresh - if it fails, the backend will return 401
        const response = await apiClient.post("/refresh");
        if (response.status === 200) {
          
          // Token refreshed successfully, retry original request
          processQueue(null, null);
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed via interceptor:", refreshError);
        // Refresh failed, redirect to login
        processQueue(refreshError, null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other errors or if refresh failed
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-storage");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
