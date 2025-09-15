"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface TransactionFiltersProps {
  searchTerm: string;
  transactionTypeFilter: string;
  monthFilter: number | undefined;
  yearFilter: number | undefined;
  dateFilter: { from: string; to: string } | undefined;
  onOpenFilterSheet: () => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchTerm,
  transactionTypeFilter,
  monthFilter,
  yearFilter,
  dateFilter,
  onOpenFilterSheet,
}) => {
  // Count active filters
  const activeFilterCount = [
    searchTerm,
    transactionTypeFilter,
    monthFilter,
    yearFilter,
    dateFilter?.from,
    dateFilter?.to,
  ].filter(Boolean).length;

  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-lg font-semibold">Transaction Records</h3>
        <p className="text-sm text-muted-foreground">
          A list of all income and expense transactions
        </p>
      </div>
      <Button variant="outline" onClick={onOpenFilterSheet}>
        <Filter className="h-4 w-4 mr-2" />
        Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
      </Button>
    </div>
  );
};

export default TransactionFilters;