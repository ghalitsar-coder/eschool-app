"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Download, Plus, X } from "lucide-react";
import { format } from "date-fns";

interface AttendanceFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateFilter: string | undefined;
  setDateFilter: (date: string | undefined) => void;
  setCurrentPage: (page: number) => void;
  setIsCreateDialogOpen: (open: boolean) => void;
  setShowExportDialog: (open: boolean) => void;
}

const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  dateFilter,
  setDateFilter,
  setCurrentPage,
  setIsCreateDialogOpen,
  setShowExportDialog,
}) => {
  return (
    <div className="flex justify-between ">
      <div className="flex flex-col gap-4   ">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <Input
              placeholder="Search by name or student ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset page when search changes
              }}
              className="max-w-sm"
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateFilter
                    ? format(new Date(dateFilter), "MMM dd, yyyy")
                    : "Filter by Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFilter ? new Date(dateFilter) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setDateFilter(format(date, "yyyy-MM-dd"));
                    } else {
                      setDateFilter(undefined);
                    }
                    setCurrentPage(1); // Reset page when date filter changes
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {(searchTerm || dateFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setDateFilter(undefined);
                setCurrentPage(1); // Reset page when clearing filters
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2  ">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExportDialog(true)}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Record Attendance
        </Button>
      </div>
    </div>
  );
};

export default AttendanceFilters;
