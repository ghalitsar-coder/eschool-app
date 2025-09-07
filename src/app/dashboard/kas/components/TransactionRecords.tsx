"use client";

import React, { useState, useEffect } from "react";

import {
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  Search,
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
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

import { useAuth } from "@/hooks/use-auth";
import { useKasRecords } from "@/hooks/use-kas";

const TransactionRecords = (props) => {
  const { setSelectedRecord, setShowDetailsDialog, isLoadingRecords } = props;
  const { user, treasurerEschoolId } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] =
    useState<string>("");
  const [dateFilter, setDateFilter] = useState<
    { from: string; to: string } | undefined
  >(undefined);
  const [monthFilter, setMonthFilter] = useState<number | undefined>(undefined);
  const [yearFilter, setYearFilter] = useState<number | undefined>(undefined);
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

  const handleClearFilters = () => {
    setSearchTerm("");
    setDateFilter(undefined);
    setTransactionTypeFilter("");
    setMonthFilter(undefined);
    setYearFilter(undefined);
    setDateFilter(undefined);
  };

  const totalPages = data?.pagination?.last_page || 1;
  const totalRecords = data?.pagination?.total || 0;
  const fromRecord = data?.pagination?.from || 0;
  const toRecord = data?.pagination?.to || 0;

  // Get current year and month for default filters
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                A list of all income and expense transactions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select
                value={transactionTypeFilter || "all"}
                onValueChange={(value) =>
                  setTransactionTypeFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={monthFilter?.toString() || "all"}
                onValueChange={(value) =>
                  setMonthFilter(value === "all" ? undefined : parseInt(value))
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
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
                value={yearFilter?.toString() || "all"}
                onValueChange={(value) =>
                  setYearFilter(value === "all" ? undefined : parseInt(value))
                }
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Date Range
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={{
                      from: dateFilter?.from
                        ? new Date(dateFilter.from)
                        : undefined,
                      to: dateFilter?.to ? new Date(dateFilter.to) : undefined,
                    }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateFilter({
                          from: format(range.from, "yyyy-MM-dd"),
                          to: format(range.to, "yyyy-MM-dd"),
                        });
                      } else if (range?.from) {
                        setDateFilter({
                          from: format(range.from, "yyyy-MM-dd"),
                          to: format(range.from, "yyyy-MM-dd"),
                        });
                      } else {
                        setDateFilter(undefined);
                      }
                    }}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
              >
                Clear
              </Button>
            </div>
          </div>
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
                        {searchTerm
                          ? "No transactions found matching your search."
                          : "No transactions recorded yet."}
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