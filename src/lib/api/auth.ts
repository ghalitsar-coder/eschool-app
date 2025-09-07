// authApi.ts - Authentication API using your existing structure
import {
    ApiResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    User,
    UserRole,
} from "@/types/api";
import apiClient from "./client";

// Define the new response structure from Laravel backend
interface LaravelLoginResponse {
    message: string;
    user: {
        id: number;
        name: string;
        email: string;
        profile: {
            id: number;
            name: string;
            date_of_birth: string;
            gender: string;
            address: string | null;
            status: string;
            created_at: string;
            updated_at: string;
        };
        roles: Array<{
            id: number;
            role: "supervisor" | "coordinator" | "treasurer" | "member";
            eschool_id: number;
            eschool_name: string;
            created_at: string;
            updated_at: string;
        }>;
    };
    token_info: {
        type: string;
        expires_in: number;
    };
}

interface LaravelRefreshResponse {
    message: string;
    user: {
        id: number;
        name: string;
        email: string;
        profile: {
            id: number;
            name: string;
            date_of_birth: string;
            gender: string;
            address: string | null;
            status: string;
            created_at: string;
            updated_at: string;
        };
        roles: Array<{
            id: number;
            role: "supervisor" | "coordinator" | "treasurer" | "member";
            eschool_id: number;
            eschool_name: string;
            created_at: string;
            updated_at: string;
        }>;
    };
    token_info: {
        type: string;
        expires_in: number;
    };
}

export const authApi = {
    login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
        const response = await apiClient.post<LaravelLoginResponse>("/login", data);
        
        // Transform the Laravel response to match frontend expectations
        return {
            success: true,
            message: response.data.message,
            data: {
                user: {
                    id: response.data.user.id,
                    name: response.data.user.name,
                    email: response.data.user.email,
                    profile: response.data.user.profile,
                    roles: response.data.user.roles,
                }
            }
        };
    },

    register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
        const response = await apiClient.post<LaravelLoginResponse>("/register", data);
        
        // Transform the Laravel response to match frontend expectations
        return {
            success: true,
            message: response.data.message,
            data: {
                id: response.data.user.id,
                name: response.data.user.name,
                email: response.data.user.email,
                profile: response.data.user.profile,
                roles: response.data.user.roles,
            }
        };
    },

    logout: async (): Promise<ApiResponse<{ message: string }>> => {
        const response = await apiClient.post("/logout");
        return response.data;
    },

    refresh: async (): Promise<ApiResponse<LoginResponse>> => {
        const response = await apiClient.post<LaravelRefreshResponse>("/refresh");
        
        // Transform the Laravel response to match frontend expectations
        return {
            success: true,
            message: response.data.message,
            data: {
                user: {
                    id: response.data.user.id,
                    name: response.data.user.name,
                    email: response.data.user.email,
                    profile: response.data.user.profile,
                    roles: response.data.user.roles,
                }
            }
        };
    },

    getProfile: async (): Promise<ApiResponse<User>> => {
        const response = await apiClient.get("/me"); // Using /me endpoint from backend
        return response.data;
    },

    getCurrentUser: async (): Promise<{ user: User; role: string }> => {
        const response = await apiClient.get("/me");
        
        // Transform the Laravel response to match frontend expectations
        return {
            user: {
                id: response.data.user.id,
                name: response.data.user.name,
                email: response.data.user.email,
                profile: response.data.user.profile,
                roles: response.data.user.roles,
            },
            // For backward compatibility, we're still returning a role string
            // In the future, we should handle multiple roles properly
            role: response.data.user.roles.length > 0 ? response.data.user.roles[0].role : "member"
        };
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
