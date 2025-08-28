import { LoginResponse, User } from "@/types/api";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (response: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: (response) => {
        set({ user:response, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, token: null });
        // Clear localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          set({ user: updatedUser });
        }
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setToken: (token: string | null) => {
        set({ token });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
