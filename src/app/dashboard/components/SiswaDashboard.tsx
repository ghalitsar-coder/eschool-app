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
import { User, TrendingUp, School } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SiswaDashboard: React.FC = () => {
  const { profileData, isLoadingProfile, profileError } = useMemberProfileData();

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="flex flex-col gap-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
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
                Failed to load student profile data. Please try again later.
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
      {/* User Profile Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-medium text-lg">{profileData?.user?.name}</h3>
              <p className="text-muted-foreground">{profileData?.user?.email}</p>
              <Badge variant="secondary">{profileData?.user?.role}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">NIP/NIS</p>
                <p>{profileData?.member?.nip || "Not provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Gender</p>
                <p>
                  {profileData?.member?.gender === "L"
                    ? "Male"
                    : profileData?.member?.gender === "P"
                    ? "Female"
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Date of Birth</p>
                <p>
                  {profileData?.member?.date_of_birth || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p>{profileData?.member?.phone || "Not provided"}</p>
              </div>
            </div>

            {profileData?.member?.address && (
              <div>
                <p className="text-muted-foreground">Address</p>
                <p>{profileData.member.address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overall Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Overall Statistics
            </CardTitle>
            <CardDescription>
              Your performance across all eschools
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700">Eschools</p>
              <p className="text-2xl font-bold text-green-900">
                {profileData?.overall_stats?.total_eschools || 0}
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">Attendance Rate</p>
              <p className="text-2xl font-bold text-blue-900">
                {profileData?.overall_stats?.average_attendance_rate || 0}%
              </p>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-purple-700">Kas Paid</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(profileData?.overall_stats?.total_kas_paid || 0)}
              </p>
            </div>

            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm text-orange-700">Outstanding</p>
              <p className="text-2xl font-bold text-orange-900">
                {formatCurrency(
                  profileData?.overall_stats?.total_kas_outstanding || 0
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eschools Participation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Eschools Participation
          </CardTitle>
          <CardDescription>
            Your participation in various eschools
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profileData?.eschools?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profileData.eschools.map((eschool: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{eschool.eschool_name}</h4>
                    <Badge variant="outline">{eschool.role_in_eschool}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Attendance</p>
                      <p className="font-medium">{eschool.attendance_rate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Kas Paid</p>
                      <p className="font-medium">
                        {formatCurrency(eschool.total_kas_paid)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              You are not participating in any eschools yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SiswaDashboard;