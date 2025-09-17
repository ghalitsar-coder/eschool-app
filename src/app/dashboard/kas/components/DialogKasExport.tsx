"use client";

import { useKasManagement } from "@/hooks/use-kas";
import { useAuth } from "@/hooks/use-auth";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import DateRangePicker from "./DateRangePicker";

const DialogKasExport = (props) => {
  const { setShowExportDialog, showExportDialog } = props;
  const { isExporting, exportRecords } = useKasManagement();
  const { treasurerEschoolId } = useAuth();

  const [exportFilters, setExportFilters] = useState({
    type: "all",
    date_from: "",
    date_to: "",
    format: "csv",
    exportType: "monthly", // Default to monthly export
    month: "",
    year: "",
  });

  const handleExport = () => {
    const exportParams: any = {
      format: exportFilters.format as "csv" | "excel",
      eschoolId: treasurerEschoolId, // Add eschoolId
    };

    // Only add type parameter if it's not "all"
    if (exportFilters.type && exportFilters.type !== "all") {
      exportParams.type = exportFilters.type;
    }

    // Handle export based on exportType
    if (exportFilters.exportType === "monthly") {
      // For monthly export, we need to construct date_from and date_to
      if (exportFilters.month && exportFilters.year) {
        const year = parseInt(exportFilters.year);
        const month = parseInt(exportFilters.month);

        // First day of the month
        exportParams.date_from = `${year}-${String(month).padStart(2, "0")}-01`;

        // Last day of the month
        const lastDay = new Date(year, month, 0).getDate();
        exportParams.date_to = `${year}-${String(month).padStart(
          2,
          "0"
        )}-${String(lastDay).padStart(2, "0")}`;
      }
    } else {
      // For custom date range export
      if (exportFilters.date_from) {
        exportParams.date_from = exportFilters.date_from;
      }

      if (exportFilters.date_to) {
        exportParams.date_to = exportFilters.date_to;
      }
    }

    exportRecords(exportParams, {
      onSuccess: () => {
        // Make sure toast is properly imported and used
        if (typeof toast !== "undefined" && toast.success) {
          toast.success("Export completed successfully");
        } else {
        }
        setShowExportDialog(false);
      },
      onError: (error: any) => {
        console.error("Export error:", error);
        // Make sure toast is properly imported and used
        if (typeof toast !== "undefined" && toast.error) {
          toast.error(`Export failed: ${error?.message || "Unknown error"}`);
        } else {
          console.error(`Export failed: ${error?.message || "Unknown error"}`);
        }
      },
    });
  };

  const isButtonDisable =
    exportFilters.exportType == "monthly"
      ? !exportFilters.month || !exportFilters.year
      : !exportFilters.date_from || !exportFilters.date_to;

  return (
    <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Transactions</DialogTitle>
          <DialogDescription>
            Export your kas transactions to a CSV file.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Transaction Type
            </label>
            <Select
              value={exportFilters.type || "all"}
              onValueChange={(value) =>
                setExportFilters({
                  ...exportFilters,
                  type: value === "all" ? "" : value,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Options - Monthly or Custom Date Range */}
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Export By
            </label>
            <Select
              value={exportFilters.exportType || "monthly"}
              onValueChange={(value) =>
                setExportFilters({
                  ...exportFilters,
                  exportType: value,
                  date_from: "",
                  date_to: "",
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select export type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Monthly Export */}
          {exportFilters.exportType === "monthly" && (
            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Select Month & Year
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={exportFilters.month || ""}
                  onValueChange={(value) =>
                    setExportFilters({ ...exportFilters, month: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">January</SelectItem>
                    <SelectItem value="2">February</SelectItem>
                    <SelectItem value="3">March</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">May</SelectItem>
                    <SelectItem value="6">June</SelectItem>
                    <SelectItem value="7">July</SelectItem>
                    <SelectItem value="8">August</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={exportFilters.year || ""}
                  onValueChange={(value) =>
                    setExportFilters({ ...exportFilters, year: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: 10 },
                      (_, i) => new Date().getFullYear() - 5 + i
                    ).map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Custom Date Range */}
          {exportFilters.exportType === "custom" && (
            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Date Range
              </label>
              <DateRangePicker
                dateFrom={exportFilters.date_from}
                dateTo={exportFilters.date_to}
                onDateChange={(dateFrom, dateTo) =>
                  setExportFilters({
                    ...exportFilters,
                    date_from: dateFrom,
                    date_to: dateTo,
                  })
                }
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Format
            </label>
            <Select
              value={exportFilters.format}
              onValueChange={(value) =>
                setExportFilters({ ...exportFilters, format: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowExportDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || isButtonDisable}
          >
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogKasExport;
