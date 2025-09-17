"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import { AttendanceStats as AttendanceStatsType } from "@/types/api";

interface AttendanceStatsProps {
  statistics: AttendanceStatsType | undefined;
  isLoadingStatistics: boolean;
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({
  statistics,
  isLoadingStatistics,
}) => {
  if (isLoadingStatistics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4  ">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Overall Attendance
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics?.total_present || 0}/{statistics?.total_records || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {statistics?.attendance_rate?.toFixed(1) || 0}% attendance rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics?.this_week?.present || 0}/
            {statistics?.this_week?.total || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {statistics?.this_week?.rate?.toFixed(1) || 0}% attendance rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics?.this_month?.present || 0}/
            {statistics?.this_month?.total || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {statistics?.this_month?.rate?.toFixed(1) || 0}% attendance rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Absent</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics?.total_absent || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {statistics?.total_late || 0} late records
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceStats;
