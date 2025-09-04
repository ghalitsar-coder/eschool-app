"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import BendaharaDashboard from "./components/BendaharaDashboard";
import KoordinatorDashboard from "./components/KoordinatorDashboard";
import StaffDashboard from "./components/StaffDashboard";
import SiswaDashboard from "./components/SiswaDashboard";
import StudentDashboardProfessional from "./components/StudentDashboardProfessional";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, User } from "lucide-react";

export default function Page() {
  const { user, isLoadingUser, isAuthenticated } = useAuth();

  // Handle redirect based on user role
 

  // Loading state
  if (isLoadingUser) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-80 mt-2" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground">
          Please log in to access your dashboard.
        </p>
      </div>
    );
  }

  // Render dashboard based on user role
  switch (user.role) {
    case "bendahara":
      return <BendaharaDashboard />;
    case "koordinator":
      return <KoordinatorDashboard />;
    case "staff":
      return <StaffDashboard />;
    case "siswa":
      // Use the professional dashboard for students with multiple roles
      return <StudentDashboardProfessional />;
    default:
      return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Unsupported Role</CardTitle>
                <CardDescription>
                  Your role "{user.role}" is not supported in the dashboard yet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-red-500">
                  Failed to load dashboard for role {user.role}. Please contact administrator.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      );
  }
}
