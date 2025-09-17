"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  UserCheck, 
  CheckCircle, 
  XCircle,
  Download
} from "lucide-react";
import { useMemberAttendance, useExportAttendance } from "@/hooks/use-member-profile";
import { Badge } from "@/components/ui/badge";

interface AttendanceTableProps {
  eschools: any[];
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ eschools }) => {
  const [selectedEschool, setSelectedEschool] = useState<number | "all">("all");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  
  const { exportAttendance } = useExportAttendance();
  
  // Tentukan eschool_id untuk query (undefined jika "all")
  const eschoolId = selectedEschool === "all" ? undefined : selectedEschool;
  
  const { data: attendanceData, isLoading, isError } = useMemberAttendance(eschoolId, page, perPage);

  const handleExport = async () => {
    await exportAttendance(eschoolId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Attendance Records
              </CardTitle>
              <CardDescription>
                Your attendance records across eschools
              </CardDescription>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Eschool</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Attendance Records
          </CardTitle>
          <CardDescription>
            Error loading attendance records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Failed to load attendance records. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Attendance Records
            </CardTitle>
            <CardDescription>
              Your attendance records across eschools
            </CardDescription>
          </div>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Select
            value={selectedEschool.toString()}
            onValueChange={(value) => {
              setSelectedEschool(value === "all" ? "all" : parseInt(value));
              setPage(1); // Reset ke halaman 1 saat filter berubah
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by eschool" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Eschools</SelectItem>
              {eschools.map((eschool) => (
                <SelectItem key={eschool.id} value={eschool.id.toString()}>
                  {eschool.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {attendanceData?.data && attendanceData.data.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Eschool</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.data.map((attendance: any) => (
                  <TableRow key={attendance.id}>
                    <TableCell className="font-medium">
                      {attendance.eschool?.name || attendance.eschool_name}
                    </TableCell>
                    <TableCell>
                      {format(new Date(attendance.date), "dd MMM yyyy", { locale: id })}
                    </TableCell>
                    <TableCell>
                      {attendance.is_present ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Present
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                          <XCircle className="h-3 w-3 mr-1" />
                          Absent
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {attendance.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {attendanceData.from} to {attendanceData.to} of {attendanceData.total} records
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === attendanceData.last_page}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {selectedEschool === "all" 
              ? "You don't have any attendance records yet." 
              : "No attendance records found for the selected eschool."}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceTable;