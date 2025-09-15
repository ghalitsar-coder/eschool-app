"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus, Filter } from "lucide-react";

interface AttendanceFiltersProps {
  searchTerm: string;
  dateFilter: string | undefined;
  setIsCreateDialogOpen: (open: boolean) => void;
  setShowExportDialog: (open: boolean) => void;
  onOpenFilterSheet: () => void;
}

const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
  searchTerm,
  dateFilter,
  setIsCreateDialogOpen,
  setShowExportDialog,
  onOpenFilterSheet,
}) => {
  const hasActiveFilters = searchTerm || dateFilter;

  return (
    <div className="flex justify-between items-center">
      <Button variant="outline" onClick={onOpenFilterSheet}>
        <Filter className="h-4 w-4 mr-2" />
        Filters {hasActiveFilters ? `(${hasActiveFilters ? 1 : 0} active)` : ""}
      </Button>
      
      <div className="flex items-center gap-2">
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

