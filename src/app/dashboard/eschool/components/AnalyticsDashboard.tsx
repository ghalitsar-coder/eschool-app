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
  Building, 
  CreditCard, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  UserCheck
} from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";
import { useAuth } from "@/hooks/use-auth";

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const {
    eschoolData,
    financialData,
    attendanceData,
    isLoadingEschoolData,
    isLoadingFinancialData,
    isLoadingAttendanceData,
  } = useAnalytics();

  // Helper function untuk format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Loading state skeletons
  if (isLoadingEschoolData || isLoadingFinancialData || isLoadingAttendanceData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Eschools */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eschools</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eschoolData?.totalEschools || 0}</div>
            <p className="text-xs text-muted-foreground">
              {eschoolData?.activeEschools || 0} active
            </p>
          </CardContent>
        </Card>

        {/* Financial Balance - Hanya untuk non-staff */}
        {user?.role !== "staff" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (financialData?.netBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(financialData?.netBalance || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Income: {formatCurrency(financialData?.totalIncome || 0)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Active Percentage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eschoolData?.activePercentage || 0}%</div>
            <Progress value={eschoolData?.activePercentage || 0} className="mt-2" />
          </CardContent>
        </Card>

        {/* Attendance Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceData?.averageAttendanceRate || 0}%</div>
            <Progress value={attendanceData?.averageAttendanceRate || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary - Hanya untuk non-staff */}
      {user?.role !== "staff" && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>
              Income vs Expense comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(financialData?.totalIncome || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Income</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(financialData?.totalExpense || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Expense</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className={`text-2xl font-bold ${
                  (financialData?.netBalance || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {formatCurrency(financialData?.netBalance || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Net Balance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Kas Distribution - Hanya untuk non-staff */}
      {user?.role !== "staff" && eschoolData?.monthlyKasDistribution && eschoolData.monthlyKasDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Kas Distribution</CardTitle>
            <CardDescription>
              Distribution of eschools by monthly kas amount
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {eschoolData.monthlyKasDistribution.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{formatCurrency(item.amount)}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {item.count} eschools
                    </span>
                    <Progress 
                      value={(item.count / (eschoolData.totalEschools || 1)) * 100} 
                      className="w-32" 
                    />
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

export default AnalyticsDashboard;