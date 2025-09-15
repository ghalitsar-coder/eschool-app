"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface DateRangePickerProps {
  dateFrom: string;
  dateTo: string;
  onDateChange: (dateFrom: string, dateTo: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateFrom,
  dateTo,
  onDateChange,
}) => {
  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      onDateChange(
        format(range.from, "yyyy-MM-dd"),
        format(range.to, "yyyy-MM-dd")
      );
    } else if (range?.from) {
      onDateChange(
        format(range.from, "yyyy-MM-dd"),
        format(range.from, "yyyy-MM-dd")
      );
    } else {
      onDateChange("", "");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <CalendarIcon className="h-4 w-4 mr-2" />
          {dateFrom && dateTo
            ? `${format(new Date(dateFrom), "MMM dd, yyyy")} - ${format(
                new Date(dateTo),
                "MMM dd, yyyy"
              )}`
            : "Select date range"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{
            from: dateFrom ? new Date(dateFrom) : undefined,
            to: dateTo ? new Date(dateTo) : undefined,
          }}
          onSelect={handleDateSelect}
          numberOfMonths={2}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;