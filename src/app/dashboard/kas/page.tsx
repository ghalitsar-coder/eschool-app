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

const KasManagement: React.FC = () => {
  const {
    records,
    members,
    isLoadingRecords,
    recordsError,
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

  const hasErrors =
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
        setShowExportDialog={setShowExportDialog}
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
