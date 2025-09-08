"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import BendaharaDashboard from "./BendaharaDashboard";
import StudentDashboardProfessional from "./StudentDashboardProfessional";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wallet, User, Users, School } from "lucide-react";

const MultiRoleDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user || !user.roles) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Role Data</h2>
        <p className="text-muted-foreground">
          Unable to load your role information.
        </p>
      </div>
    );
  }

  // Get user roles
  const userRoles = user.roles || [];
  const treasurerRoles = userRoles.filter((role) => role.role === "treasurer");
  const memberRoles = userRoles.filter((role) => role.role === "member");

  const hasTreasurer = treasurerRoles.length > 0;
  const hasMember = memberRoles.length > 0;
  const hasMultipleRoles = hasTreasurer && hasMember;

  // If user only has one type of role, show the appropriate dashboard directly
  if (hasTreasurer && !hasMember) {
    return <BendaharaDashboard />;
  }

  if (hasMember && !hasTreasurer) {
    return <StudentDashboardProfessional />;
  }

  // If user has both treasurer and member roles, show tabs
  if (hasMultipleRoles) {
    return (
      <div className="flex flex-col gap-6 py-6">
        {/* Header */}
        <div className="px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {userRoles.map((roleData, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {roleData.role === "treasurer" ? (
                    <Wallet className="h-3 w-3" />
                  ) : (
                    <Users className="h-3 w-3" />
                  )}
                  {roleData.role === "treasurer" ? "Bendahara" : "Member"} -{" "}
                  {roleData.eschool_name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Role Tabs */}
        <div className="px-4 lg:px-6">
          <Tabs defaultValue="bendahara" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="bendahara"
                className="flex items-center gap-2"
              >
                <Wallet className="h-4 w-4" />
                Bendahara Dashboard
              </TabsTrigger>
              <TabsTrigger value="member" className="flex items-center gap-2">
                <School className="h-4 w-4" />
                Member Dashboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bendahara" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Bendahara Dashboard
                  </CardTitle>
                  <CardDescription>
                    Manage kas and financial records for your eschool
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      Active as Bendahara in:
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {treasurerRoles.map((role, index) => (
                        <Badge key={index} variant="secondary">
                          {role.eschool_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="mt-6">
                <BendaharaDashboard />
              </div>
            </TabsContent>

            <TabsContent value="member" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5" />
                    Member Dashboard
                  </CardTitle>
                  <CardDescription>
                    View your participation and activities across all eschools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">Member of:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {memberRoles.map((role, index) => (
                        <Badge key={index} variant="secondary">
                          {role.eschool_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="mt-6">
                <StudentDashboardProfessional />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Fallback - should not reach here
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>No Suitable Dashboard</CardTitle>
            <CardDescription>
              Unable to determine the appropriate dashboard for your roles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please contact administrator for assistance.
            </p>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Your roles:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {userRoles.map((role, index) => (
                  <Badge key={index} variant="outline">
                    {role.role} - {role.eschool_name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MultiRoleDashboard;
