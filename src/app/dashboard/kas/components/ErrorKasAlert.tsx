import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import React from "react";

const ErrorKasAlert = (props) => {
  const {
    summaryError,
    recordsError,
    membersError,
    addIncomeError,
    addExpenseError,
    exportError,
  } = props;
  return (
    <div className="px-4 lg:px-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {summaryError && <div>Summary: {summaryError.message}</div>}
          {recordsError && <div>Records: {recordsError.message}</div>}
          {membersError && <div>Members: {membersError.message}</div>}
          {addIncomeError && <div>Add Income: {addIncomeError.message}</div>}
          {addExpenseError && <div>Add Expense: {addExpenseError.message}</div>}
          {exportError && <div>Export: {exportError.message}</div>}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ErrorKasAlert;
