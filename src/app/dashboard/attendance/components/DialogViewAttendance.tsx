"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { AttendanceRecord } from "@/types/api";

interface DialogViewAttendanceProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
}

const DialogViewAttendance: React.FC<DialogViewAttendanceProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Attendance Details</DialogTitle>
          <DialogDescription>
            View detailed information about this attendance record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Date</Label>
            <p className="text-gray-600">
              {format(new Date(record.date), "MMMM dd, yyyy")}
            </p>
          </div>

          <div>
            <Label>Member</Label>
            <p className="text-gray-600">{record.member.name}</p>
            {record.member.student_id && record.member.student_id !== "N/A" && (
              <p className="text-sm text-gray-500">
                Student ID: {record.member.student_id}
              </p>
            )}
          </div>

          <div>
            <Label>Status</Label>
            <div className="mt-1">
              <Badge variant={record.is_present ? "default" : "destructive"}>
                {record.is_present ? "Present" : "Absent"}
              </Badge>
            </div>
          </div>

          <div>
            <Label>Recorded By</Label>
            <p className="text-gray-600">
              {record.recorder?.name || "Unknown"}
            </p>
          </div>

          {record.notes && (
            <div>
              <Label>Notes</Label>
              <p className="text-gray-600">{record.notes}</p>
            </div>
          )}

          {record.proof_document && (
            <div>
              <Label>Proof Document</Label>
              <a
                href={record.proof_document}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Document
              </a>
            </div>
          )}

          <div>
            <Label>Recorded At</Label>
            <p className="text-gray-600">
              {format(new Date(record.created_at), "MMMM dd, yyyy 'at' HH:mm")}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogViewAttendance;
