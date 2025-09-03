"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useKasManagement } from "@/hooks/use-kas";
import FinancialTrend from "../kas/components/FinancialTrend";
import FinancialCharts from "../kas/components/FinancialCharts";

const BendaharaDashboard: React.FC = () => {
  const {
    records,
    summary,
    isLoadingRecords,
    isLoadingSummary,
    recordsError,
    summaryError,
  } = useKasManagement();

  // Loading state
  if (isLoadingRecords || isLoadingSummary) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mt-2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  const hasErrors =
    recordsError ||
    summaryError;
  if (hasErrors) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Loading Data</CardTitle>
              <CardDescription>
                {recordsError?.message || summaryError?.message || "Unknown error occurred"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">
                Failed to load financial data. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Financial Trends */}
      <FinancialTrend />

      {/* Financial Charts */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Analytics</CardTitle>
            <CardDescription>
              Visual representation of income and expense trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FinancialCharts 
              summary={summary} 
              records={records} 
              isLoading={isLoadingRecords || isLoadingSummary}
              error={recordsError || summaryError}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BendaharaDashboard;