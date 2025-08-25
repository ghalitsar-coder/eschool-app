// authApi.ts - Authentication API using your existing structure
import {
    ApiResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    User,
} from "@/types/api";
import apiClient from "./client";

export const authApi = {
    login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
        const response = await apiClient.post("/login", data);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
        const response = await apiClient.post("/register", data);
        return response.data;
    },

    logout: async (): Promise<ApiResponse<{ message: string }>> => {
        const response = await apiClient.post("/logout");
        return response.data;
    },

    refresh: async (): Promise<ApiResponse<LoginResponse>> => {
        const response = await apiClient.post("/refresh");
        return response.data;
    },

    getProfile: async (): Promise<ApiResponse<User>> => {
        const response = await apiClient.get("/user"); // Using /user endpoint from backend
        return response.data;
    },

    getCurrentUser: async (): Promise<{ user: User; role: string }> => {
        const response = await apiClient.get("/user");
        return response.data;
    },

    changePassword: async (data: {
        current_password: string;
        new_password: string;
    }): Promise<ApiResponse<{ message: string }>> => {
        const response = await apiClient.put("/profile/password", data);
        return response.data;
    },
};

export default authApi;
