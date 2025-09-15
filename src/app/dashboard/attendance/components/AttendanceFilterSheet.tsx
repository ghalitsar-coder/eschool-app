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
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

interface AttendanceFilterSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateFilter: string | undefined;
  setDateFilter: (date: string | undefined) => void;
  setCurrentPage: (page: number) => void;
}

const AttendanceFilterSheet: React.FC<AttendanceFilterSheetProps> = ({
  isOpen,
  onOpenChange,
  searchTerm,
  setSearchTerm,
  dateFilter,
  setDateFilter,
  setCurrentPage,
}) => {
  const handleClearFilters = () => {
    setSearchTerm("");
    setDateFilter(undefined);
    setCurrentPage(1);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDateFilter(format(date, "yyyy-MM-dd"));
    } else {
      setDateFilter(undefined);
    }
    setCurrentPage(1);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md px-5">
        <SheetHeader>
          <SheetTitle>Filter Attendance Records</SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Search
              </label>
              <Input
                placeholder="Search by name or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full mt-2 justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dateFilter
                      ? format(new Date(dateFilter), "MMM dd, yyyy")
                      : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFilter ? new Date(dateFilter) : undefined}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {(searchTerm || dateFilter) && (
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

export default AttendanceFilterSheet;