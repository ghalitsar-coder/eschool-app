"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";

import {
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
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

const DialogKasDetail = (props) => {
  const {
    showDetailsDialog,
    setShowDetailsDialog,
    selectedRecord,
    setSelectedRecord,
    setShowUpdateDialog,
    updateForm,
  } = props;
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Detailed information about this transaction
          </DialogDescription>
        </DialogHeader>
        {selectedRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Date
                </label>
                <p className="text-gray-600">
                  {new Date(selectedRecord.date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Type
                </label>
                <Badge
                  variant={
                    selectedRecord.type === "income" ? "default" : "secondary"
                  }
                  className={
                    selectedRecord.type === "income"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  {selectedRecord.type === "income" ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {selectedRecord.type}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Description
              </label>
              <p className="text-gray-600">{selectedRecord.description}</p>
            </div>
            {selectedRecord.category && (
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Category
                </label>
                <p className="text-gray-600">{selectedRecord.category}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Amount
              </label>
              <p
                className={`text-xl font-bold ${
                  selectedRecord.type === "income"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {selectedRecord.type === "income" ? "+" : "-"}Rp{" "}
                {selectedRecord.amount.toLocaleString()}
              </p>
            </div>
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
                          <TableHead>Amount</TableHead>
                          <TableHead>Period</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedRecord.payments.map((payment: any) => (
                          <TableRow key={payment.id}>
                            <TableCell>{payment.member_name}</TableCell>
                            <TableCell>
                              Rp {payment.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {payment.month}/{payment.year}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Recorded By
              </label>
              <p className="text-gray-600">{selectedRecord.created_by}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Created At
                </label>
                <p className="text-gray-600">
                  {new Date(selectedRecord.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Updated At
                </label>
                <p className="text-gray-600">
                  {new Date(selectedRecord.updated_at).toLocaleString()}
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
