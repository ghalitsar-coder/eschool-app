"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAttendanceManagement } from "@/hooks/use-attendance";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle2, CalendarIcon, Users, TrendingUp } from "lucide-react";

const KoordinatorDashboard: React.FC = () => {
  const {
    statistics,
    analytics,
    isLoadingStatistics,
    isLoadingAnalytics,
    statisticsError,
    analyticsError,
  } = useAttendanceManagement();

  // Loading state
  if (isLoadingStatistics || isLoadingAnalytics) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  const hasErrors = statisticsError || analyticsError;
  if (hasErrors) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Loading Data</CardTitle>
              <CardDescription>
                {statisticsError?.message || analyticsError?.message || "Unknown error occurred"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">
                Failed to load attendance data. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if required data is available
  if (!statistics || !analytics) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>No Data Available</CardTitle>
              <CardDescription>
                Attendance data is not available at this time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No attendance data found. Please check back later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow">
          <p className="font-bold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Attendance
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.today?.present || 0}/{statistics?.today?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {statistics?.today?.percentage || 0}% present
            </p>
          </CardContent>
        </Card>
        <Card className="@container/card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.week?.present || 0}/{statistics?.week?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {statistics?.week?.percentage || 0}% present
            </p>
          </CardContent>
        </Card>
        <Card className="@container/card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              This Month
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.month?.present || 0}/{statistics?.month?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {statistics?.month?.percentage || 0}% present
            </p>
          </CardContent>
        </Card>
        <Card className="@container/card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.total_members || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Analytics</CardTitle>
            <CardDescription>
              Comprehensive attendance analytics and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Overall Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Overall Rate
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics?.overall?.attendance_rate ?? 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average attendance rate
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Present
                    </CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics?.overall?.total_present ?? 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Members present
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Members
                    </CardTitle>
                    <Users className="h-4 w-4 text-indigo-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics?.overall?.total_members ?? 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active members
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Sessions
                    </CardTitle>
                    <CalendarIcon className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics?.overall?.total_possible ?? 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total attendance sessions
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Attendance Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Attendance Overview</CardTitle>
                    <CardDescription>
                      Attendance trends over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics?.daily_summary || []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="formatted_date"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                          dataKey="present"
                          name="Present"
                          fill="#10B981"
                        />
                        <Bar dataKey="absent" name="Absent" fill="#EF4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Member Attendance Rate Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Members</CardTitle>
                    <CardDescription>
                      Members with highest attendance rates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics?.member_attendance || []}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={90}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value) => [
                            `${value}%`,
                            "Attendance Rate",
                          ]}
                          labelFormatter={(value) => `Member: ${value}`}
                        />
                        <Bar
                          dataKey="attendance_rate"
                          name="Attendance Rate"
                          fill="#3B82F6"
                        >
                          {analytics?.member_attendance?.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.attendance_rate >= 90
                                    ? "#10B981"
                                    : entry.attendance_rate >= 75
                                    ? "#F59E0B"
                                    : "#EF4444"
                                  }
                              />
                            )
                          )}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Weekday Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekday Attendance Analysis</CardTitle>
                  <CardDescription>
                    Average attendance rates by day of the week
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analytics?.weekday_analysis || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="short_day" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip
                        formatter={(value) => [
                          `${value}%`,
                          "Attendance Rate",
                        ]}
                        labelFormatter={(value) => `Day: ${value}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="average_attendance_rate"
                        name="Attendance Rate"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KoordinatorDashboard;