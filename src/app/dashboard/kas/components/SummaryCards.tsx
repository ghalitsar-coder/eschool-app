"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet, Users } from "lucide-react";
import { useKasManagement } from "@/hooks/use-kas";

const SummaryCards = () => {
  const { summary, isLoadingSummary } = useKasManagement();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate percentage change
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
      {/* Total Income */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          {isLoadingSummary ? (
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {formatCurrency(summary?.summary?.total_income)}
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly dues, donations, etc.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          {isLoadingSummary ? (
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">

                {formatCurrency(summary?.summary?.total_expense)}
              </div>
              <p className="text-xs text-muted-foreground">
                Equipment, supplies, etc.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Current Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          <Wallet className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          {isLoadingSummary ? (
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.summary.balance)}
              </div>
              <p className="text-xs text-muted-foreground">Available funds</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
          <Users className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          {isLoadingSummary ? (
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {summary.current_month.payment_percentage.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.current_month.paid_count} paid of{" "}
                {summary.summary.total_members} members
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
