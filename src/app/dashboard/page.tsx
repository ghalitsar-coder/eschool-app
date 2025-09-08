"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import KoordinatorDashboard from "./components/KoordinatorDashboard";
import StaffDashboard from "./components/StaffDashboard";
import MultiRoleDashboard from "./components/MultiRoleDashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

export default function Page() {
  const { user, isAuthenticated } = useAuth();

  console.log(`THIS IS  ~ user:`, user);

  // Loading state - check if user data is still being fetched
  if (isAuthenticated && !user) {
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

  // Get user roles
  const userRoles = user.roles?.map((role) => role.role) || [];

  // Determine dashboard type based on roles
  const hasCoordinator = userRoles.includes("coordinator");
  const hasSupervisor = userRoles.includes("supervisor");
  const hasTreasurer = userRoles.includes("treasurer");
  const hasMember = userRoles.includes("member");

  // Priority: supervisor > coordinator > multi-role (treasurer/member)
  if (hasSupervisor) {
    return <StaffDashboard />;
  }

  if (hasCoordinator) {
    return <KoordinatorDashboard />;
  }

  if (hasTreasurer || hasMember) {
    return <MultiRoleDashboard />;
  }

  // Fallback for unsupported roles
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>No Dashboard Available</CardTitle>
            <CardDescription>
              No suitable dashboard found for your current roles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please contact administrator if you believe this is an error.
            </p>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Your roles:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {userRoles.map((role, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-muted rounded-md text-sm"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
 