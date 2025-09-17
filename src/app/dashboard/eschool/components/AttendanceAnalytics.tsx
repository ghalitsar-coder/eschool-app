"use client";

import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useAttendanceAnalyticsDetails } from "@/hooks/use-analytics";

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AttendanceAnalytics = () => {
  const { data: attendanceData, isLoading } = useAttendanceAnalyticsDetails();

  const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
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

  // Transform data for charts
  const attendanceRatesData = attendanceData?.data?.member_attendance?.map((member: any) => ({
    eschool: member.name,
    rate: member.attendance_rate
  })) || [];

  const trendsData = attendanceData?.data?.daily_summary?.map((day: any) => ({
    date: day.formatted_date,
    rate: day.total > 0 ? (day.present / day.total) * 100 : 0
  })) || [];

  const memberPatternsData = attendanceData?.data?.member_attendance || [];

  return (
    <div className="space-y-6">
      {/* Average Attendance Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Average Attendance Rate</CardTitle>
          <CardDescription>
            Overall attendance across all eschools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">
              {attendanceData?.data?.overall?.attendance_rate || 0}%
            </div>
            <Progress 
              value={attendanceData?.data?.overall?.attendance_rate || 0} 
              className="mt-4 w-full max-w-md mx-auto" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Attendance Rates by Eschool */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Rates by Member</CardTitle>
            <CardDescription>
              Comparison across different members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={attendanceRatesData}
                layout="vertical"
                margin={{
                  top: 20,
                  right: 30,
                  left: 100,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis 
                  dataKey="eschool" 
                  type="category" 
                  scale="band" 
                  width={90}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="rate" fill="#3B82F6" name="Attendance Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>
              Daily attendance patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={trendsData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#10B981"
                  activeDot={{ r: 8 }}
                  name="Attendance Rate"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Member Attendance Patterns */}
      {(memberPatternsData && memberPatternsData.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Top Member Attendance</CardTitle>
            <CardDescription>
              Members with highest attendance rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memberPatternsData.slice(0, 5).map((member: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="font-medium">{member.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {member.attendance_rate}%
                    </span>
                    <Progress value={member.attendance_rate} className="w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceAnalytics;