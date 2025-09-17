"use client";

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

interface DialogExportAttendanceProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isExporting: boolean;
}

const DialogExportAttendance: React.FC<DialogExportAttendanceProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isExporting,
}) => {
  const [exportFilters, setExportFilters] = useState({
    exportType: "monthly", // Default to monthly export
    month: "",
    year: "",
    date_from: "",
    date_to: "",
    format: "csv",
  });

  const handleExport = async () => {
    try {
      const exportParams: any = {
        format: exportFilters.format as "csv" | "pdf",
      };

      // Handle export based on exportType
      if (exportFilters.exportType === "monthly") {
        // For monthly export, we need to construct start_date and end_date
        if (exportFilters.month && exportFilters.year) {
          const year = parseInt(exportFilters.year);
          const month = parseInt(exportFilters.month);

          // First day of the month
          exportParams.start_date = `${year}-${String(month).padStart(
            2,
            "0"
          )}-01`;

          // Last day of the month
          const lastDay = new Date(year, month, 0).getDate();
          exportParams.end_date = `${year}-${String(month).padStart(
            2,
            "0"
          )}-${String(lastDay).padStart(2, "0")}`;
        } else {
          toast.error("Please select month and year for monthly export");
          return;
        }
      } else {
        // For custom date range export
        if (!exportFilters.date_from || !exportFilters.date_to) {
          toast.error(
            "Please select both start and end dates for custom range export"
          );
          return;
        }
        exportParams.start_date = exportFilters.date_from;
        exportParams.end_date = exportFilters.date_to;
      }

      await onSubmit(exportParams);
      onClose();
      toast.success("Export completed successfully");
    } catch (error: unknown) {
      console.error("Export error:", error);
      toast.error(`Export failed: ${error?.message || "Unknown error"}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Attendance Records</DialogTitle>
          <DialogDescription>
            Export your attendance records to a CSV or PDF file.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  From Date
                </label>
                <Input
                  type="date"
                  value={exportFilters.date_from}
                  onChange={(e) =>
                    setExportFilters({
                      ...exportFilters,
                      date_from: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  To Date
                </label>
                <Input
                  type="date"
                  value={exportFilters.date_to}
                  onChange={(e) =>
                    setExportFilters({
                      ...exportFilters,
                      date_to: e.target.value,
                    })
                  }
                />
              </div>
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
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogExportAttendance;
