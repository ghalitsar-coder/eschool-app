"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  Edit,
  Trash2,
  Download,
  Plus,
  SquareArrowOutDownLeftIcon,
} from "lucide-react";
import { format } from "date-fns";
import { AttendanceRecord } from "@/types/api";

interface AttendanceTableProps {
  records: AttendanceRecord[] | undefined;
  isLoadingRecords: boolean;
  searchTerm: string;
  dateFilter: string | undefined;
  onViewRecord: (record: AttendanceRecord) => void;
  onEditRecord: (record: AttendanceRecord) => void;
  onDeleteRecord: (record: AttendanceRecord) => void;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  isLoadingRecords,
  searchTerm,
  dateFilter,
  onViewRecord,
  onEditRecord,

  onDeleteRecord,
}) => {
  if (isLoadingRecords) {
    return (
      <div className="">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              Loading attendance records...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className=" ">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recorded By</TableHead>
                  <TableHead>Proof Document</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!records || records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {searchTerm || dateFilter
                        ? "No records found matching your search."
                        : "No attendance records recorded yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  records?.map((record) => {
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {format(new Date(record.date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {record.member.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {record.member.student_id &&
                            record.member.student_id !== "N/A"
                              ? record.member.student_id
                              : `ID: ${record.member.user_id}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.is_present ? "default" : "destructive"
                            }
                          >
                            {record.is_present ? "Present" : "Absent"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.recorder?.name || (
                            <span className="italic text-xs text-gray-400">
                              Nama tidak ditemukan
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.proof_document && (
                            <a
                              href={record.proof_document}
                              target="_blank"
                              className="flex items-center gap-x-2 text-blue-800"
                            >
                              Document <SquareArrowOutDownLeftIcon size={15} />{" "}
                            </a>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.notes ? (
                            <span className="text-sm">{record.notes}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No notes
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewRecord(record)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditRecord(record)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteRecord(record)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceTable;
