"use client";

import { useKasManagement } from "@/hooks/use-kas";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FinancialCharts from "./components/FinancialCharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

import { ExpenseFormData, expenseSchema } from "@/types/page/kas";
import DialogKasIncome from "./components/DialogKasIncome";
import DialogKasExpense from "./components/DialogKasExpense";
import FinancialTrend from "./components/FinancialTrend";
import TransactionRecords from "./components/TransactionRecords";
import DialogKasExport from "./components/DialogKasExport";
import DialogKasDetail from "./components/DialogKasDetail";
import HeaderKas from "./components/HeaderKas";
import ErrorKasAlert from "./components/ErrorKasAlert";
import DialogUpdateKas from "./components/DialogUpdateKas";

const KasManagement: React.FC = () => {
  const {
    records,
    summary,
    members,
    isLoadingRecords,
    recordsError,
    summaryError,
    membersError,
    addIncomeError,
    addExpenseError,
    exportError,
  } = useKasManagement();
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const updateForm = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: "",
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  // Generate mock monthly data for charts (in a real app, this would come from API)
  const monthlyData = useMemo(() => {
    const data = [];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 0; i < 12; i++) {
      // Generate realistic mock data
      const income = Math.floor(Math.random() * 5000000) + 2000000; // 2-7 million
      const expense = Math.floor(Math.random() * 3000000) + 1000000; // 1-4 million

      data.push({
        month: months[i],
        income: income,
        expense: expense,
        balance: income - expense,
      });
    }

    return data;
  }, []);

  // Generate data for income vs expense pie chart
  const incomeVsExpenseData = useMemo(
    () => [
      { name: "Income", value: summary.summary.total_income },
      { name: "Expense", value: summary.summary.total_expense },
    ],
    [summary]
  );

  // Colors for charts
  const COLORS = ["#10B981", "#EF4444"]; // Green for income, red for expense

  // Calculate pagination

  // if (isLoadingSummary || isLoadingRecords || isLoadingMembers) {
  //   return (
  //     <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
  //       <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
  //         {[...Array(4)].map((_, i) => (
  //           <Card key={i}>
  //             <CardHeader className="pb-2">
  //               <Skeleton className="h-4 w-24" />
  //               <Skeleton className="h-8 w-32" />
  //             </CardHeader>
  //           </Card>
  //         ))}
  //       </div>
  //       <div className="px-4 lg:px-6">
  //         <Card>
  //           <CardHeader>
  //             <Skeleton className="h-6 w-48" />
  //           </CardHeader>
  //           <CardContent>
  //             <Skeleton className="h-64 w-full" />
  //           </CardContent>
  //         </Card>
  //       </div>
  //     </div>
  //   );
  // }

  const hasErrors =
    summaryError ||
    recordsError ||
    membersError ||
    addIncomeError ||
    addExpenseError ||
    exportError;

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <HeaderKas setShowExportDialog={setShowExportDialog} />

      {/* Error Alert */}
      {hasErrors && <ErrorKasAlert />}

      {/* Summary Cards */}

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
            <FinancialCharts summary={summary} records={records} />
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <DialogKasIncome />
          <DialogKasExpense />
        </div>
      </div>

      {/* Transactions Table */}
      <TransactionRecords
        setSelectedRecord={setSelectedRecord}
        setShowDetailsDialog={setShowDetailsDialog}
        records={records}
        isLoadingRecords={isLoadingRecords}
      />

      {/* Export Dialog */}
      <DialogKasExport
        showExportDialog={showExportDialog}
      />

      {/* Update Expense Dialog */}
      <DialogKasExpense />

      {/* Transaction Details Dialog */}
      <DialogKasDetail
        selectedRecord={selectedRecord}
        setSelectedRecord={setSelectedRecord}
        updateForm={updateForm}
        setShowUpdateDialog={setShowUpdateDialog}
      />
      {/* Update Expense Dialog */}
      <DialogUpdateKas
        showUpdateDialog={showUpdateDialog}
        setShowUpdateDialog={setShowUpdateDialog}
        selectedRecord={selectedRecord}
        updateForm={updateForm}
      />
    </div>
  );
};

export default KasManagement;
