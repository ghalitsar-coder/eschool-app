"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useMultiRoleProfile } from "@/hooks/use-multi-role-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  TrendingUp, 
  School, 
  Users, 
  Calendar,
  Wallet,
  BarChart3,
  PieChart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

// Import our data structure types
import type { MultiRoleProfileData } from "@/hooks/use-multi-role-profile";

const StudentDashboard: React.FC = () => {
  const { 
    profileData, 
    isLoadingProfile, 
    profileError 
  } = useMultiRoleProfile();
  
  const [activeTab, setActiveTab] = useState("overview");

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="flex flex-col gap-6 py-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <Skeleton className="h-10 w-24 mr-2" />
            <Skeleton className="h-10 w-24 mr-2" />
            <Skeleton className="h-10 w-24" />
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
            
            <Card className="mt-6">
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
          </TabsContent>
        </Tabs>
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
                {profileError?.message || "Failed to load student profile data"}
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

  // Check if profileData exists
  if (!profileData) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>No Data Available</CardTitle>
              <CardDescription>
                No profile data found for this user.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Please contact administrator if this issue persists.
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

  // Generate chart data for attendance comparison
  const attendanceComparisonData = profileData.eschool_roles?.map(role => ({
    name: role.eschool_name,
    attendance: role.attendance_summary.attendance_rate,
    meetings: role.attendance_summary.total_meetings,
    attended: role.attendance_summary.attended
  })) || [];

  // Generate chart data for kas comparison
  const kasComparisonData = profileData.eschool_roles?.map(role => ({
    name: role.eschool_name,
    paid: role.kas_summary.personal_balance || 0,
    target: role.kas_summary.monthly_target || 0,
    collectionRate: role.kas_summary.collection_rate || 0
  })) || [];

  // Generate role distribution data
  const roleDistributionData = [
    { name: "Bendahara", value: profileData.overall_summary.roles.bendahara || 0 },
    { name: "Koordinator", value: profileData.overall_summary.roles.koordinator || 0 },
    { name: "Member", value: profileData.overall_summary.roles.member || 0 }
  ];

  // COLORS for charts
  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <Badge variant="secondary">
          {profileData.user?.name}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {profileData.eschool_roles?.map((role) => (
            <TabsTrigger key={role.eschool_id} value={`eschool-${role.eschool_id}`}>
              {role.eschool_name}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* User Profile Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-medium text-lg">{profileData.user?.name}</h3>
                  <p className="text-muted-foreground">{profileData.user?.email}</p>
                  <Badge variant="secondary">{profileData.user?.base_role}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Eschools</p>
                    <p className="font-medium">{profileData.overall_summary?.total_eschools || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Attendance</p>
                    <p className="font-medium">
                      {profileData.overall_summary?.performance?.avg_attendance_rate || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Kas Paid</p>
                    <p className="font-medium">
                      {formatCurrency(profileData.overall_summary?.performance?.total_personal_kas || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Activity Score</p>
                    <p className="font-medium">
                      {profileData.overall_summary?.performance?.overall_activity_score || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overall Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Role Distribution
                </CardTitle>
                <CardDescription>
                  Your roles across eschools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie
                      data={roleDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {roleDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Count']} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Attendance Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Attendance Comparison
                </CardTitle>
                <CardDescription>
                  Your attendance rate across different eschools
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={attendanceComparisonData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Attendance Rate']}
                      labelFormatter={(value) => `Eschool: ${value}`}
                    />
                    <Legend />
                    <Bar dataKey="attendance" name="Attendance Rate" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Kas Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Kas Payment Comparison
                </CardTitle>
                <CardDescription>
                  Your payment status across different eschools
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={kasComparisonData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'paid') {
                          return [formatCurrency(value as number), 'Paid'];
                        }
                        if (name === 'target') {
                          return [formatCurrency(value as number), 'Target'];
                        }
                        return [`${value}%`, 'Collection Rate'];
                      }}
                      labelFormatter={(value) => `Eschool: ${value}`}
                    />
                    <Legend />
                    <Bar dataKey="paid" name="Paid" fill="#10B981" />
                    <Bar dataKey="target" name="Target" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activities
              </CardTitle>
              <CardDescription>
                Your latest activities across eschools
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileData.recent_activities?.length > 0 ? (
                <div className="space-y-4">
                  {profileData.recent_activities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{activity.eschool_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                        </div>
                        <Badge variant="outline">{activity.role_context}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-medium capitalize">{activity.type.replace('_', ' ')}</p>
                        </div>
                        {activity.amount && (
                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-medium">{formatCurrency(activity.amount)}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {new Date(activity.date).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No recent activities found.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Eschool Tabs */}
        {profileData.eschool_roles?.map((role) => (
          <TabsContent key={role.eschool_id} value={`eschool-${role.eschool_id}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Eschool Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5" />
                    {role.eschool_name}
                  </CardTitle>
                  <CardDescription>
                    Your role: <span className="font-medium">{role.role_in_eschool}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge 
                      variant={role.status === 'active' ? 'default' : 'destructive'}
                    >
                      {role.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Assigned Date</p>
                      <p className="font-medium">
                        {new Date(role.assigned_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Permissions</p>
                      <p className="font-medium">{role.permissions.length}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">Permissions</p>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attendance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Attendance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">Total Meetings</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {role.attendance_summary.total_meetings}
                    </p>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-700">Attended</p>
                    <p className="text-2xl font-bold text-green-900">
                      {role.attendance_summary.attended}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-purple-700">Attendance Rate</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {role.attendance_summary.attendance_rate}%
                    </p>
                  </div>

                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm text-orange-700">Absent</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {role.attendance_summary.total_meetings - role.attendance_summary.attended}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Kas Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Kas Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-700">Personal Balance</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(role.kas_summary.personal_balance || 0)}
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">Monthly Target</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(role.kas_summary.monthly_target || 0)}
                  </p>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-purple-700">Collection Rate</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {role.kas_summary.collection_rate || 0}%
                  </p>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-orange-700">Payment Status</p>
                  <p className="text-2xl font-bold text-orange-900 capitalize">
                    {role.kas_summary.payment_status || 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Charts for Individual Eschool */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Attendance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Attendance Trend
                  </CardTitle>
                  <CardDescription>
                    Your attendance in {role.eschool_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: "Attendance",
                          value: role.attendance_summary.attendance_rate
                        },
                        {
                          name: "Absent",
                          value: 100 - role.attendance_summary.attendance_rate
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Rate']}
                      />
                      <Bar dataKey="value" name="Percentage" fill="#3B82F6">
                        <Cell fill="#10B981" />
                        <Cell fill="#EF4444" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Kas Payment Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Kas Payment Status
                  </CardTitle>
                  <CardDescription>
                    Your payment status in {role.eschool_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={[
                          {
                            name: "Paid",
                            value: role.kas_summary.personal_balance || 0
                          },
                          {
                            name: "Pending",
                            value: (role.kas_summary.monthly_target || 0) - (role.kas_summary.personal_balance || 0)
                          }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#F59E0B" />
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value as number), 'Amount']}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default StudentDashboard;