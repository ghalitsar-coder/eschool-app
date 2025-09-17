"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { AttendanceRecord } from "@/types/api";

interface DialogDeleteAttendanceProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  record: AttendanceRecord | null;
  isDeleting: boolean;
}

const DialogDeleteAttendance: React.FC<DialogDeleteAttendanceProps> = ({
  isOpen,
  onClose,
  onConfirm,
  record,
  isDeleting,
}) => {
  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Attendance Record
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this attendance record? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <div className="rounded-lg bg-gray-50 p-3 space-y-1">
            <p className="text-sm">
              <strong>Date:</strong>{" "}
              {new Date(record.date).toLocaleDateString()}
            </p>
            <p className="text-sm">
              <strong>Member:</strong> {record.member.name}
            </p>
            <p className="text-sm">
              <strong>Status:</strong>{" "}
              <span
                className={
                  record.is_present ? "text-green-600" : "text-red-600"
                }
              >
                {record.is_present ? "Present" : "Absent"}
              </span>
            </p>
            {record.notes && (
              <p className="text-sm">
                <strong>Notes:</strong> {record.notes}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogDeleteAttendance;
