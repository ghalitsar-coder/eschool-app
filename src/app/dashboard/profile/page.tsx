"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  CreditCard,
  Calendar,
  UserCheck,
  TrendingUp,
  Users,
  School,
} from "lucide-react";
import { useMemberProfileData } from "@/hooks/use-member-profile";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import AttendanceTable from "./components/AttendanceTable";
import KasTable from "./components/KasTable";

const MemberProfile: React.FC = () => {
  const { profileData, isLoadingProfile } = useMemberProfileData();

  // Helper function untuk format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Loading state skeletons
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

        {/* Chart Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Table Skeletons */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground">
          Your profile data is not available. Please contact administrator.
        </p>
      </div>
    );
  }

  // Handle berbagai tipe profile berdasarkan role
  const profileType = profileData.user.profile_type || "siswa";
  const isStudent =
    profileType === "siswa" || profileData.user.role === "siswa";
  const isCoordinator =
    profileType === "coordinator" || profileData.user.role === "koordinator";
  const isStaff =
    profileType === "staff_overview" || profileData.user.role === "staff";
  const isTreasurer =
    profileType === "treasurer" || profileData.user.role === "bendahara";

  // Warna untuk chart
  const COLORS = [
    "#10B981",
    "#EF4444",
    "#3B82F6",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
  ];
  const PIE_COLORS = ["#10B981", "#EF4444"];

  // Render berbagai tipe profile
  if (isStudent) {
    return (
      <StudentProfile
        profileData={profileData}
        formatCurrency={formatCurrency}
      />
    );
  } else if (isCoordinator) {
    return (
      <CoordinatorProfile
        profileData={profileData}
        formatCurrency={formatCurrency}
      />
    );
  } else if (isStaff) {
    return (
      <StaffProfile profileData={profileData} formatCurrency={formatCurrency} />
    );
  } else if (isTreasurer) {
    return (
      <TreasurerProfile
        profileData={profileData}
        formatCurrency={formatCurrency}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <User className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">Unsupported Profile Type</h2>
      <p className="text-muted-foreground">
        Profile type {profileType} is not supported yet.
      </p>
    </div>
  );
};

// Component untuk siswa
const StudentProfile: React.FC<{
  profileData: any;
  formatCurrency: (amount: number) => string;
}> = ({ profileData, formatCurrency }) => {
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
              <h3 className="font-medium text-lg">{profileData.user.name}</h3>
              <p className="text-muted-foreground">{profileData.user.email}</p>
              <Badge variant="secondary">{profileData.user.role}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">NIP/NIS</p>
                <p>{profileData.member?.nip || "Not provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Gender</p>
                <p>
                  {profileData.member?.gender === "L"
                    ? "Male"
                    : profileData.member?.gender === "P"
                    ? "Female"
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Date of Birth</p>
                <p>
                  {profileData.member?.date_of_birth
                    ? format(
                        new Date(profileData.member.date_of_birth),
                        "dd MMMM yyyy",
                        { locale: id }
                      )
                    : "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p>{profileData.member?.phone || "Not provided"}</p>
              </div>
            </div>

            {profileData.member?.address && (
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
                {profileData.overall_stats?.total_eschools || 0}
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">Attendance Rate</p>
              <p className="text-2xl font-bold text-blue-900">
                {profileData.overall_stats?.average_attendance_rate || 0}%
              </p>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-purple-700">Kas Paid</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(profileData.overall_stats?.total_kas_paid || 0)}
              </p>
            </div>

            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm text-orange-700">Outstanding</p>
              <p className="text-2xl font-bold text-orange-900">
                {formatCurrency(
                  profileData.overall_stats?.total_kas_outstanding || 0
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rest of student components - charts, tables, etc. */}
      <AttendanceTable eschools={profileData.eschools || []} />
      <KasTable eschools={profileData.eschools || []} />
    </div>
  );
};

// Component untuk koordinator
const CoordinatorProfile: React.FC<{
  profileData: any;
  formatCurrency: (amount: number) => string;
}> = ({ profileData, formatCurrency }) => {
  return (
    <div className="flex flex-col gap-6 py-6">
      {/* User Profile Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Coordinator Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-medium text-lg">{profileData.user.name}</h3>
              <p className="text-muted-foreground">{profileData.user.email}</p>
              <Badge variant="secondary">{profileData.user.role}</Badge>
            </div>

            <div className="text-sm">
              <p className="text-muted-foreground">Coordinating Eschool</p>
              <p className="font-medium">
                {profileData.eschool?.name || "No eschool assigned"}
              </p>
              {profileData.eschool?.description && (
                <p className="text-muted-foreground text-xs">
                  {profileData.eschool.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Eschool Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Eschool Statistics
            </CardTitle>
            <CardDescription>
              Overview of your coordinated eschool
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700">Members</p>
              <p className="text-2xl font-bold text-green-900">
                {profileData.statistics?.total_members || 0}
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">Attendance Rate</p>
              <p className="text-2xl font-bold text-blue-900">
                {profileData.statistics?.attendance_rate || 0}%
              </p>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-purple-700">Kas Collected</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(
                  profileData.statistics?.total_kas_collected || 0
                )}
              </p>
            </div>

            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm text-orange-700">Collection Rate</p>
              <p className="text-2xl font-bold text-orange-900">
                {profileData.statistics?.kas_collection_rate || 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Recent Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profileData.recent_activities?.recent_attendance?.length > 0 ? (
              <div className="space-y-2">
                {profileData.recent_activities.recent_attendance.map(
                  (record: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium">{record.member?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(record.date), "dd MMM yyyy")}
                        </p>
                      </div>
                      <Badge
                        variant={record.is_present ? "default" : "destructive"}
                      >
                        {record.is_present ? "Present" : "Absent"}
                      </Badge>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No recent attendance records
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profileData.recent_activities?.recent_payments?.length > 0 ? (
              <div className="space-y-2">
                {profileData.recent_activities.recent_payments.map(
                  (payment: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium">{payment.member_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payment.paid_date), "dd MMM yyyy")}
                        </p>
                      </div>
                      <p className="font-medium text-green-600">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent payments</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Component untuk staff (overview)
const StaffProfile: React.FC<{
  profileData: any;
  formatCurrency: (amount: number) => string;
}> = ({ profileData, formatCurrency }) => {
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
              {profileData.overview_statistics?.total_eschools || 0}
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">Total Members</p>
            <p className="text-2xl font-bold text-blue-900">
              {profileData.overview_statistics?.total_members || 0}
            </p>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-purple-700">Avg Attendance</p>
            <p className="text-2xl font-bold text-purple-900">
              {profileData.overview_statistics?.average_attendance_rate || 0}%
            </p>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-sm text-orange-700">Collection Rate</p>
            <p className="text-2xl font-bold text-orange-900">
              {profileData.overview_statistics?.overall_collection_rate || 0}%
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
            {profileData.eschool_breakdown?.map(
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

// Component untuk bendahara
const TreasurerProfile: React.FC<{
  profileData: any;
  formatCurrency: (amount: number) => string;
}> = ({ profileData, formatCurrency }) => {
  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Financial Summary
            </CardTitle>
            <CardDescription>
              Financial overview of {profileData.eschool?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700">Current Balance</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(
                  profileData.financial_summary?.current_balance || 0
                )}
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">Total Income</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(
                  profileData.financial_summary?.total_income || 0
                )}
              </p>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-purple-700">Total Expense</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(
                  profileData.financial_summary?.total_expense || 0
                )}
              </p>
            </div>

            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm text-orange-700">Collection Rate</p>
              <p className="text-2xl font-bold text-orange-900">
                {profileData.financial_summary?.collection_rate || 0}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Eschool Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-medium text-lg">
                {profileData.eschool?.name}
              </h3>
              <p className="text-muted-foreground">
                {profileData.eschool?.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Monthly Kas</p>
                <p>
                  {formatCurrency(profileData.eschool?.monthly_kas_amount || 0)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Coordinator</p>
                <p>{profileData.eschool?.coordinator_name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {profileData.recent_payments?.length > 0 ? (
            <div className="space-y-2">
              {profileData.recent_payments
                .slice(0, 10)
                .map((payment: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border rounded"
                  >
                    <div>
                      <p className="font-medium">{payment.member_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payment.paid_date), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent payments</p>
          )}
        </CardContent>
      </Card>

      {/* Outstanding Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {profileData.outstanding_payments?.length > 0 ? (
            <div className="space-y-2">
              {profileData.outstanding_payments
                .slice(0, 10)
                .map((payment: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border rounded"
                  >
                    <div>
                      <p className="font-medium">{payment.member_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.month}/{payment.year}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No outstanding payments</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberProfile;
