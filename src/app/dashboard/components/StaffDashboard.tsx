"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMemberProfileData } from "../../../hooks/use-member-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, School, TrendingUp, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const StaffDashboard: React.FC = () => {
  const { profileData, isLoadingProfile, profileError } = useMemberProfileData();

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="flex flex-col gap-6 py-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded-lg">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[...Array(3)].map((_, j) => (
                      <div key={j}>
                        <Skeleton className="h-3 w-24 mb-1" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (profileError) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Loading Data</CardTitle>
              <CardDescription>
                {profileError?.message}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">
                Failed to load staff overview data. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Helper function untuk format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col gap-6 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Overview
          </CardTitle>
          <CardDescription>
            Overview of all eschools in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-700">Total Eschools</p>
            <p className="text-2xl font-bold text-green-900">
              {profileData?.overview_statistics?.total_eschools || 0}
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">Total Members</p>
            <p className="text-2xl font-bold text-blue-900">
              {profileData?.overview_statistics?.total_members || 0}
            </p>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-purple-700">Avg Attendance</p>
            <p className="text-2xl font-bold text-purple-900">
              {profileData?.overview_statistics?.average_attendance_rate || 0}%
            </p>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-sm text-orange-700">Collection Rate</p>
            <p className="text-2xl font-bold text-orange-900">
              {profileData?.overview_statistics?.overall_collection_rate || 0}%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Eschool Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Eschool Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profileData?.eschool_breakdown?.map(
              (eschool: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{eschool.eschool_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Coordinator: {eschool.coordinator_name} | Treasurer:{" "}
                        {eschool.treasurer_name}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {eschool.total_members} members
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Attendance</p>
                      <p className="font-medium">{eschool.attendance_rate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Kas Collection</p>
                      <p className="font-medium">
                        {eschool.kas_collection_rate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Collected</p>
                      <p className="font-medium">
                        {formatCurrency(eschool.total_kas_collected)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboard;