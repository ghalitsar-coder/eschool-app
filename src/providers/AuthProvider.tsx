"use client";

import { useAuthStore } from "@/lib/stores/auth";
import { useEffect } from "react";

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // const initializeAuth = useAuthStore((state) => state.initializeAuth);

  // useEffect(() => {
  //   initializeAuth();
  // }, [initializeAuth]);

  return <>{children}</>;
};
