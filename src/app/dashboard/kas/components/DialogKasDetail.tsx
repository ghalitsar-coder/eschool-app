"use client";

import React from "react";

import {
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  User,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useKasRecords } from "@/hooks/use-kas";
import { useAuth } from "@/hooks/use-auth";

const DialogKasDetail = (props) => {
  const {
    showDetailsDialog,
    setShowDetailsDialog,
    selectedRecord,
    setSelectedRecord,
    setShowUpdateDialog,
    updateForm,
  } = props;

  const { treasurerEschoolId } = useAuth();
  const { data } = useKasRecords({ eschoolId: treasurerEschoolId });

  const handleOpenUpdate = (record: any) => {
    setSelectedRecord(record);
    setShowDetailsDialog(false); // Close details dialog
    setShowUpdateDialog(true);

    // Set form values
    updateForm.reset({
      amount: record.amount.toString(),
      description: record.description,
      category: record.category || "",
      date: record.date.split("T")[0] || new Date().toISOString().split("T")[0],
    });
  };

  return (
    <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Detailed information about this transaction
          </DialogDescription>
        </DialogHeader>
        {selectedRecord && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date
                </label>
                <p className="text-gray-600 mt-1">
                  {new Date(selectedRecord.date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                  Type
                </label>
                <Badge
                  variant={
                    selectedRecord.type === "income" ? "default" : "secondary"
                  }
                  className={
                    selectedRecord.type === "income"
                      ? "bg-green-100 text-green-800 hover:bg-green-100 mt-1"
                      : "bg-red-100 text-red-800 hover:bg-red-100 mt-1"
                  }
                >
                  {selectedRecord.type === "income" ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {selectedRecord.type.charAt(0).toUpperCase() +
                    selectedRecord.type.slice(1)}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Description
              </label>
              <p className="text-gray-600 mt-1">{selectedRecord.description}</p>
            </div>

            {selectedRecord.category && (
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Category
                </label>
                <p className="text-gray-600 mt-1 capitalize">
                  {selectedRecord.category.replace("_", " ")}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Amount
              </label>
              <p
                className={`text-2xl font-bold mt-1 ${
                  selectedRecord.type === "income"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {selectedRecord.type === "income" ? "+" : "-"}Rp{" "}
                {selectedRecord.amount.toLocaleString("id-ID")}
              </p>
            </div>

            {/* Payment Details for Income */}
            {selectedRecord.type === "income" &&
              selectedRecord.payments &&
              selectedRecord.payments.length > 0 && (
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Payment Details
                  </label>
                  <div className="border rounded-md mt-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Period</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedRecord.payments.map((payment: any) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">
                              {payment.member_name}
                            </TableCell>
                            <TableCell className="text-right">
                              Rp {payment.amount.toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                payment.year,
                                payment.month - 1
                              ).toLocaleDateString("id-ID", {
                                month: "long",
                                year: "numeric",
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted font-bold">
                          <TableCell>Total</TableCell>
                          <TableCell className="text-right">
                            Rp{" "}
                            {selectedRecord.payments
                              .reduce(
                                (sum: number, payment: any) =>
                                  sum + payment.amount,
                                0
                              )
                              .toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Total {selectedRecord.payments.length} member
                    {selectedRecord.payments.length > 1 ? "s" : ""}
                  </p>
                </div>
              )}

            {/* Expense Details */}
            {selectedRecord.type === "expense" && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h4 className="font-medium text-red-800 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Expense Information
                </h4>
                <p className="text-sm text-red-600 mt-1">
                  This is an expense transaction for the eschool activities.
                </p>
              </div>
            )}

            {/* Recorded By Information */}
            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                <User className="h-4 w-4" />
                Recorded By
              </label>
              <p className="text-gray-600 mt-1">
                {selectedRecord.recorder?.user?.profile?.name ||
                  selectedRecord.created_by ||
                  "Unknown User"}
              </p>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Created At
                </label>
                <p className="text-gray-600 mt-1">
                  {new Date(selectedRecord.created_at).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Updated At
                </label>
                <p className="text-gray-600 mt-1">
                  {new Date(selectedRecord.updated_at).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
            Close
          </Button>
          {selectedRecord && selectedRecord.type === "expense" && (
            <Button onClick={() => handleOpenUpdate(selectedRecord)}>
              Edit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogKasDetail;
