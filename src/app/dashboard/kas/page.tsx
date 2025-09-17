"use client";

import { useKasManagement } from "@/hooks/use-kas";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ExpenseFormData, expenseSchema } from "@/types/page/kas";
import DialogKasIncome from "./components/DialogKasIncome";
import DialogKasExpense from "./components/DialogKasExpense";
import TransactionRecords from "./components/TransactionRecords";
import DialogKasExport from "./components/DialogKasExport";
import DialogKasDetail from "./components/DialogKasDetail";
import HeaderKas from "./components/HeaderKas";
import ErrorKasAlert from "./components/ErrorKasAlert";
import DialogUpdateKas from "./components/DialogUpdateKas";
import SummaryCards from "./components/SummaryCards";
import KasFilterSheet from "./components/KasFilterSheet";
import PaymentStatisticsTable from "./components/PaymentStatisticsTable";
import { useAuth } from "@/hooks/use-auth";

const KasManagement: React.FC = () => {
  const {
    isLoadingRecords,
    recordsError,
    membersError,
    addIncomeError,
    addExpenseError,
    exportError,
  } = useKasManagement();
  const { treasurerEschoolId } = useAuth();
  const [selectedRecord, setSelectedRecord] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] =
    useState<string>("");
  const [dateFilter, setDateFilter] = useState<
    { from: string; to: string } | undefined
  >(undefined);
  const [monthFilter, setMonthFilter] = useState<number | undefined>(undefined);
  const [yearFilter, setYearFilter] = useState<number | undefined>(undefined);

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

  const hasErrors =
    recordsError ||
    membersError ||
    addIncomeError ||
    addExpenseError ||
    exportError;

  // Get current year for default filters
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <HeaderKas setShowExportDialog={setShowExportDialog} />

      {/* Summary Cards */}
      <SummaryCards />

      {/* Error Alert */}
      {hasErrors && <ErrorKasAlert />}

      {/* Action Buttons */}
      {treasurerEschoolId && (
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <DialogKasIncome />
            <DialogKasExpense />
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <TransactionRecords
        setSelectedRecord={setSelectedRecord}
        setShowDetailsDialog={setShowDetailsDialog}
        isLoadingRecords={isLoadingRecords}
        onOpenFilterSheet={() => setShowFilterSheet(true)}
        // Filter states
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        transactionTypeFilter={transactionTypeFilter}
        setTransactionTypeFilter={setTransactionTypeFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        monthFilter={monthFilter}
        setMonthFilter={setMonthFilter}
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
      />

      {/* Payment Statistics */}
      <PaymentStatisticsTable />

      {/* Filter Sheet */}
      <KasFilterSheet
        isOpen={showFilterSheet}
        onOpenChange={setShowFilterSheet}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        transactionTypeFilter={transactionTypeFilter}
        setTransactionTypeFilter={setTransactionTypeFilter}
        monthFilter={monthFilter}
        setMonthFilter={setMonthFilter}
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        currentYear={currentYear}
      />

      {/* Export Dialog */}
      <DialogKasExport
        showExportDialog={showExportDialog}
        setShowExportDialog={setShowExportDialog}
      />

      {/* Transaction Details Dialog */}
      <DialogKasDetail
        selectedRecord={selectedRecord}
        showDetailsDialog={showDetailsDialog}
        setSelectedRecord={setSelectedRecord}
        setShowDetailsDialog={setShowDetailsDialog}
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
