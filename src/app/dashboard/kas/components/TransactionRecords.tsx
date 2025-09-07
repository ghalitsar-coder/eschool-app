"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";

import {
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  Search,
  Trash2,
  ChevronDownIcon,
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
  const { data } = useKasRecords({ eschoolId: treasurerEschoolId });
  console.log(`🚀 ~ TransactionRecords.tsx:57 ~ data:`, data)


  const [searchTerm, setSearchTerm] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] =
    useState<string>("");
  const [dateFilter, setDateFilter] = useState<
    { from: string; to: string } | undefined
  >(undefined);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "date",
    direction: "desc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const records = [];

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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Filter by Date
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
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter(undefined);
                  setTransactionTypeFilter("");
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingRecords ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
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
          )}
          {/* Pagination */}
          {0 > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredAndSortedRecords.length)} of{" "}
                {filteredAndSortedRecords.length} transactions
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionRecords;
