"use client";

import React, { useState, useEffect } from "react";

import {
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useAuth } from "@/hooks/use-auth";
import { useKasRecords } from "@/hooks/use-kas";
import TransactionFilters from "./TransactionFilters";

const TransactionRecords = (props) => {
  const { 
    setSelectedRecord, 
    setShowDetailsDialog, 
    isLoadingRecords, 
    onOpenFilterSheet,
    // Filter states
    searchTerm,
    setSearchTerm,
    transactionTypeFilter,
    setTransactionTypeFilter,
    dateFilter,
    setDateFilter,
    monthFilter,
    setMonthFilter,
    yearFilter,
    setYearFilter
  } = props;
  const { user, treasurerEschoolId } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "date",
    direction: "desc",
  });

  // Derived filter state for API
  const apiFilters = {
    eschoolId: treasurerEschoolId,
    page: currentPage,
    per_page: itemsPerPage,
    type: transactionTypeFilter && transactionTypeFilter !== "all" ? transactionTypeFilter : undefined,
    search: searchTerm || undefined,
    date_from: dateFilter?.from || undefined,
    date_to: dateFilter?.to || undefined,
    month: monthFilter || undefined,
    year: yearFilter || undefined,
  };

  const { data, isLoading, refetch } = useKasRecords(apiFilters);

  const handleViewDetails = (record: any) => {
    console.log(`THIS IS  ~ record:`, record)
    setSelectedRecord(record);
    setShowDetailsDialog(true);
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const totalPages = data?.pagination?.last_page || 1;
  const totalRecords = data?.pagination?.total || 0;
  const fromRecord = data?.pagination?.from || 0;
  const toRecord = data?.pagination?.to || 0;

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <TransactionFilters
            searchTerm={searchTerm}
            transactionTypeFilter={transactionTypeFilter}
            monthFilter={monthFilter}
            yearFilter={yearFilter}
            dateFilter={dateFilter}
            onOpenFilterSheet={onOpenFilterSheet}
          />
        </CardHeader>
        <CardContent>
          {isLoading || isLoadingRecords ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center">
                        Date
                        {sortConfig.key === "date" &&
                          (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => handleSort("type")}
                    >
                      <div className="flex items-center">
                        Type
                        {sortConfig.key === "type" &&
                          (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                      </div>
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead
                      className="text-right cursor-pointer hover:bg-muted"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center justify-end">
                        Amount
                        {sortConfig.key === "amount" &&
                          (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No transactions recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data?.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            {new Date(record.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.type === "income" ? "default" : "secondary"
                            }
                            className={
                              record.type === "income"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-red-100 text-red-800 hover:bg-red-100"
                            }
                          >
                            {record.type === "income" ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {record.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.description}</TableCell>
                        <TableCell className="text-right font-medium">
                          <span
                            className={
                              record.type === "income"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {record.type === "income" ? "+" : "-"}Rp{" "}
                            {record.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(record)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {fromRecord} to {toRecord} of {totalRecords} transactions
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionRecords;