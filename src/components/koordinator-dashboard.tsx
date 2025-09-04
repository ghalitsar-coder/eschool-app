"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useKoordinatorDashboard } from "@/hooks/use-koordinator-dashboard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import {
  Users,
  TrendingUp,
  DollarSign,
  UserCheck,
  UserX,
  AlertCircle,
} from "lucide-react";

export default function KoordinatorDashboard() {
  const {
    dashboardData,
    isLoadingDashboard,
    dashboardError,
    refetchDashboard,
  } = useKoordinatorDashboard();

  if (isLoadingDashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="space-y-4">
        <ErrorMessage
          message={`Failed to load dashboard: ${dashboardError.message}`}
        />
        <Button onClick={() => refetchDashboard()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No dashboard data available</p>
      </div>
    );
  }

  const {
    user_context,
    eschool,
    statistics,
    recent_activities,
    multi_role_insights,
  } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Koordinator Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user_context.name} - {eschool.name}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total_members}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.active_members} active members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.attendance_rate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {statistics.present_sessions} of {statistics.total_sessions}{" "}
              sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kas Collection
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.kas_collection_rate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Rp {statistics.total_kas_collected.toLocaleString()} collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outstanding Kas
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {statistics.outstanding_kas.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From Rp {statistics.total_kas_expected.toLocaleString()} expected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role Breakdown and Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
            <CardDescription>Member roles in {eschool.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Koordinator</span>
                <Badge variant="default">
                  {statistics.role_breakdown.koordinator}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Bendahara</span>
                <Badge variant="secondary">
                  {statistics.role_breakdown.bendahara}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Members</span>
                <Badge variant="outline">
                  {statistics.role_breakdown.member}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eschool Schedule</CardTitle>
            <CardDescription>{eschool.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Schedule Days</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {eschool.schedule_days.map((day) => (
                    <Badge key={day} variant="outline" className="text-xs">
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Monthly Kas Amount</p>
                <p className="text-lg font-semibold">
                  Rp {eschool.monthly_kas_amount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>Latest attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recent_activities.recent_attendance.length > 0 ? (
                recent_activities.recent_attendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div className="flex items-center space-x-3">
                      {record.is_present ? (
                        <UserCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <UserX className="h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {record.member_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.date).toLocaleDateString()} •{" "}
                          {record.role_in_eschool}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={record.is_present ? "default" : "destructive"}
                    >
                      {record.is_present ? "Present" : "Absent"}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent attendance records
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest kas payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recent_activities.recent_payments.length > 0 ? (
                recent_activities.recent_payments.map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">
                          {payment.member_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.paid_date).toLocaleDateString()} •{" "}
                          {payment.role_in_eschool}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Rp {payment.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Approved by {payment.approved_by}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent payments
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Role Insights */}
      {multi_role_insights.users_with_multiple_roles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Multi-Role Participation</CardTitle>
            <CardDescription>
              Members participating in multiple eschools (
              {multi_role_insights.cross_participation_rate.toFixed(1)}%
              cross-participation rate)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {multi_role_insights.users_with_multiple_roles.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.roles_in_school.map((role, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {role.role} in Eschool {role.eschool_id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {user.roles_in_school.length} roles
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <a href="/dashboard/attendance">Manage Attendance</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/dashboard/members">Manage Members</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/dashboard/kas">View Kas Reports</a>
        </Button>
      </div>
    </div>
  );
}
