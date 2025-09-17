"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

interface KasFilterSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  transactionTypeFilter: string;
  setTransactionTypeFilter: (type: string) => void;
  monthFilter: number | undefined;
  setMonthFilter: (month: number | undefined) => void;
  yearFilter: number | undefined;
  setYearFilter: (year: number | undefined) => void;
  dateFilter: { from: string; to: string } | undefined;
  setDateFilter: (date: { from: string; to: string } | undefined) => void;
  currentYear: number;
}

const KasFilterSheet: React.FC<KasFilterSheetProps> = ({
  isOpen,
  onOpenChange,
  searchTerm,
  setSearchTerm,
  transactionTypeFilter,
  setTransactionTypeFilter,
  monthFilter,
  setMonthFilter,
  yearFilter,
  setYearFilter,
  dateFilter,
  setDateFilter,
  currentYear,
}) => {
  const handleClearFilters = () => {
    setSearchTerm("");
    setTransactionTypeFilter("");
    setMonthFilter(undefined);
    setYearFilter(undefined);
    setDateFilter(undefined);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filter Transactions</SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-4 px-5">
            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Search
              </label>
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className=" ">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed   peer-disabled:opacity-70">
                Transaction Type
              </label>
              <Select
                value={transactionTypeFilter || "all"}
                onValueChange={(value) =>
                  setTransactionTypeFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="w-full  ">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Month
              </label>
              <Select
                value={monthFilter?.toString() || "all"}
                onValueChange={(value) =>
                  setMonthFilter(value === "all" ? undefined : parseInt(value))
                }
              >
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder="Select month" />
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
            </div>

            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Year
              </label>
              <Select
                value={yearFilter?.toString() || "all"}
                onValueChange={(value) =>
                  setYearFilter(value === "all" ? undefined : parseInt(value))
                }
              >
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {Array.from(
                    { length: 10 },
                    (_, i) => currentYear - 5 + i
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Date Range
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full mt-2 justify-start"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dateFilter?.from && dateFilter?.to
                      ? `${format(
                          new Date(dateFilter.from),
                          "MMM dd, yyyy"
                        )} - ${format(new Date(dateFilter.to), "MMM dd, yyyy")}`
                      : "Select date range"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
            </div>
          </div>

          {(searchTerm ||
            transactionTypeFilter ||
            monthFilter ||
            yearFilter ||
            dateFilter) && (
            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        <SheetFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default KasFilterSheet;
