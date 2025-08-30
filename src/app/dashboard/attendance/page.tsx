"use client";

import { useState, useMemo } from "react";
import { useAttendanceManagement } from "@/hooks/use-attendance";
import { useAuthStore } from "@/lib/stores/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Badge,
  badgeVariants,
} from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  ArrowLeft,
  Plus,
  User,
  Download,
  FileSpreadsheet,
  FileText,
  BarChart3,
  CheckCircle2,
  Calendar as CalendarIcon,
  Eye,
  Edit,
  Trash2,
  Filter,
  MoreVertical,
  ChevronDownIcon,
  Search,
} from "lucide-react";
import { format, startOfWeek } from "date-fns";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const attendanceSchema = z.object({
  date: z.string().min(1, "Date is required"),
  members: z
    .array(
      z.object({
        member_id: z.string().min(1, "Please select a member"),
        is_present: z.boolean(),
        notes: z.string().nullable(),
      })
    )
    .min(1, "At least one member attendance is required"),
});

const updateAttendanceSchema = z.object({
  member_id: z.string().min(1, "Please select a member"),
  is_present: z.boolean(),
  notes: z.string().nullable(),
  date: z.string().min(1, "Date is required"),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;
type UpdateAttendanceFormData = z.infer<typeof updateAttendanceSchema>;

const AttendancePage = () => {
  const { user } = useAuthStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string | undefined>(undefined);

  const {
    records,
    statistics,
    members,
    isLoadingRecords,
    isLoadingStatistics,
    isLoadingMembers,
    isCreating,
    isUpdating,
    isDeleting,
    recordsError,
    statisticsError,
    membersError,
    createError,
    updateError,
    deleteError,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    refetchRecords,
    refetchStatistics,
  } = useAttendanceManagement();
    console.log(`🚀 ~ page.tsx:156 ~ members:`, members)


  const attendanceForm = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      members: [{ member_id: "", is_present: true, notes: null }],
    },
  });

  const updateAttendanceForm = useForm<UpdateAttendanceFormData>({
    resolver: zodResolver(updateAttendanceSchema),
    defaultValues: {
      member_id: "",
      is_present: true,
      notes: null,
      date: new Date().toISOString().split("T")[0],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: attendanceForm.control,
    name: "members",
  });

  const watchedMembers = attendanceForm.watch("members");

  const handleCreateAttendance = async (data: AttendanceFormData) => {
    try {
      // Ensure data is properly formatted before sending
      const formattedData = {
        ...data,
        members: data.members.map(member => ({
          ...member,
          member_id: Number(member.member_id),
          is_present: Boolean(member.is_present)
        }))
      };
      
      await createAttendance(formattedData);
      attendanceForm.reset();
      setIsCreateDialogOpen(false);
      refetchRecords();
      refetchStatistics();
      toast.success("Attendance recorded successfully");
    } catch (error: any) {
      console.error("Error creating attendance:", error);
      
      // Handle validation errors from backend
      const errorMessage = error?.response?.data?.message || error?.message || "An unexpected error occurred";
      const errorMessages = error?.response?.data?.messages || [];
      
      if (Array.isArray(errorMessages) && errorMessages.length > 0) {
        // Display all validation messages
        toast.error("Failed to record attendance", {
          description: (
            <div className="space-y-1">
              {errorMessages.map((msg: string, index: number) => (
                <div key={index}>❌ {msg}</div>
              ))}
            </div>
          ),
        });
      } else {
        toast.error("Failed to record attendance", {
          description: errorMessage,
        });
      }
    }
  };

  const handleUpdateAttendance = async (data: UpdateAttendanceFormData) => {
    try {
      if (!selectedRecord) return;
      await updateAttendance({ id: selectedRecord.id, data });
      setIsEditDialogOpen(false);
      refetchRecords();
      refetchStatistics();
      toast.success("Attendance updated successfully");
    } catch (error: any) {
      console.error("Error updating attendance:", error);
      toast.error("Failed to update attendance", {
        description: error?.message || "An unexpected error occurred",
      });
    }
  };

  const handleDeleteAttendance = async () => {
    try {
      if (!selectedRecord) return;
      await deleteAttendance(selectedRecord.id);
      setIsDeleteDialogOpen(false);
      refetchRecords();
      refetchStatistics();
      toast.success("Attendance deleted successfully");
    } catch (error: any) {
      console.error("Error deleting attendance:", error);
      toast.error("Failed to delete attendance", {
        description: error?.message || "An unexpected error occurred",
      });
    }
  };

  const handleViewRecord = (record: any) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  const handleEditRecord = (record: any) => {
    setSelectedRecord(record);
    updateAttendanceForm.setValue("member_id", record.member.id.toString());
    updateAttendanceForm.setValue("is_present", record.is_present);
    updateAttendanceForm.setValue("notes", record.notes || "");
    updateAttendanceForm.setValue("date", record.date.split("T")[0] || record.date);
    setIsEditDialogOpen(true);
  };

  const handleDeleteRecord = (record: any) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      if (!user?.eschool_id) {
        toast.error("Unable to export: No eschool ID found");
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const params = new URLSearchParams({
        eschool_id: user.eschool_id.toString()
      });

      // Add date filter if available
      if (dateFilter) {
        params.append('start_date', dateFilter);
        params.append('end_date', dateFilter);
      }

      const url = `${baseUrl}/attendance/export/${format}?${params.toString()}`;
      
      // For authenticated download, we need to use fetch and create a blob
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Accept': 'text/csv,application/pdf',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to export ${format.toUpperCase()}`);
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `attendance_export_${new Date().toISOString().split('T')[0]}.${format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success(`${format.toUpperCase()} export completed successfully`);
    } catch (error: any) {
      console.error(`Error exporting ${format}:`, error);
      toast.error(`Failed to export ${format.toUpperCase()}`, {
        description: error?.message || "An unexpected error occurred"
      });
    }
  };

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    
    return records.filter((record) => {
      const matchesSearch = 
        record.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        "";
      
      const matchesDate = dateFilter 
        ? new Date(record.date).toDateString() === new Date(dateFilter).toDateString()
        : true;
        
      return matchesSearch && matchesDate;
    });
  }, [records, searchTerm, dateFilter]);

  const chartData = useMemo(() => {
    if (!records) return [];
    
    // Group records by date
    const groupedRecords: Record<string, { present: number; total: number }> = {};
    
    records.forEach((record) => {
      const dateKey = format(new Date(record.date), "yyyy-MM-dd");
      if (!groupedRecords[dateKey]) {
        groupedRecords[dateKey] = { present: 0, total: 0 };
      }
      groupedRecords[dateKey].total += 1;
      if (record.is_present) {
        groupedRecords[dateKey].present += 1;
      }
    });
    
    // Convert to chart data format
    return Object.entries(groupedRecords)
      .map(([date, stats]) => ({
        date: format(new Date(date), "MMM dd"),
        percentage: stats.total > 0 ? (stats.present / stats.total) * 100 : 0,
        present: stats.present,
        total: stats.total,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  }, [records]);

  const hasErrors = recordsError || statisticsError || membersError || createError || updateError || deleteError;

  if (!user) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Attendance Management</h1>
              <p className="text-muted-foreground">Track and manage member attendance</p>
            </div>
          </div>
        </div>
        <div className="px-4 lg:px-6">
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Attendance Management</h1>
            <p className="text-muted-foreground">Track and manage member attendance</p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {["koordinator", "staff"].includes(user.role) && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Attendance
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Record Attendance</DialogTitle>
                    <DialogDescription>
                      Record attendance for members on a specific date
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...attendanceForm}>
                    <form
                      onSubmit={attendanceForm.handleSubmit(handleCreateAttendance)}
                      className="space-y-4"
                    >
                      <FormField
                        control={attendanceForm.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-between font-normal"
                                  >
                                    {field.value
                                      ? format(new Date(field.value), "MMM dd, yyyy")
                                      : "Select date"}
                                    <ChevronDownIcon className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value ? new Date(field.value) : undefined}
                                    defaultMonth={field.value ? new Date(field.value) : new Date()}
                                    captionLayout="dropdown"
                                    onSelect={(date) => {
                                      if (date) {
                                        field.onChange(format(date, "yyyy-MM-dd"));
                                      }
                                    }}
                                    disabled={(date) =>
                                      date.getFullYear() < 2020 || date.getFullYear() > 2100
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Member Attendance</h3>
                        {attendanceForm.formState.errors.root?.message && (
                          <ul className="text-red-500 text-sm mt-2">
                            {(Array.isArray(attendanceForm.formState.errors.root?.message)
                              ? attendanceForm.formState.errors.root.message
                              : [attendanceForm.formState.errors.root?.message]
                            ).map((msg, idx) => (
                              <li key={idx}>❌ {msg}</li>
                            ))}
                          </ul>
                        )}
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Member</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Notes</TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {fields.map((field, index) => {
                              const memberIds = watchedMembers
                                .map((m) => m.member_id)
                                .filter((id) => id !== "");
                              const currentMemberId = watchedMembers[index]?.member_id || "";

                              return (
                                <TableRow key={field.id}>
                                  <TableCell>
                                    <FormField
                                      control={attendanceForm.control}
                                      name={`members.${index}.member_id`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Select
                                              onValueChange={(value) => field.onChange(value)}
                                              value={field.value ? String(field.value) : ""}
                                            >
                                              <SelectTrigger>
                                                <SelectValue
                                                  placeholder={
                                                    isLoadingMembers
                                                      ? "Loading members..."
                                                      : "Select a member"
                                                  }
                                                />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {members?.map((member) => {
                                                  const isUsed =
                                                    memberIds.includes(String(member.id)) &&
                                                    String(member.id) !== currentMemberId;

                                                  return (
                                                    <SelectItem
                                                      key={member.id}
                                                      value={String(member.id)}
                                                      disabled={isUsed}
                                                    >
                                                      {member.name}
                                                  {member.student_id ? ` - ${member.student_id}` : ` (ID: ${member.id})`}
                                                  {member.email && ` - ${member.email}`}
                                                      {member.student_id
                                                        ? ` - ${member.student_id}`
                                                        : ""}
                                                    </SelectItem>
                                                  );
                                                })}
                                              </SelectContent>
                                            </Select>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <FormField
                                      control={attendanceForm.control}
                                      name={`members.${index}.is_present`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Select
                                              onValueChange={(value) =>
                                                field.onChange(value === "true")
                                              }
                                              value={field.value.toString()}
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="true">Hadir</SelectItem>
                                                <SelectItem value="false">Tidak Hadir</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <FormField
                                      control={attendanceForm.control}
                                      name={`members.${index}.notes`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input
                                              placeholder="Optional notes"
                                              value={field.value || ""}
                                              onChange={(e) =>
                                                field.onChange(e.target.value || null)
                                              }
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() => remove(index)}
                                      disabled={fields.length === 1}
                                      aria-label="Remove member"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            append({ member_id: "", is_present: true, notes: null })
                          }
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Member
                        </Button>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={
                            isCreating ||
                            watchedMembers.some((member) => !member.member_id)
                          }
                        >
                          {isCreating ? "Recording..." : "Record Attendance"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {hasErrors && (
        <div className="px-4 lg:px-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {recordsError && <div>Records: {recordsError.message}</div>}
              {statisticsError && <div>Statistics: {statisticsError.message}</div>}
              {membersError && <div>Members: {membersError.message}</div>}
              {createError && <div>Create: {createError.message}</div>}
              {updateError && <div>Update: {updateError.message}</div>}
              {deleteError && <div>Delete: {deleteError.message}</div>}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {isLoadingStatistics ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </CardHeader>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="@container/card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today&apos;s Attendance</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics?.today.present}/{statistics?.today.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statistics?.today.percentage}% present
                </p>
              </CardContent>
            </Card>
            <Card className="@container/card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <CalendarIcon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics?.week.present}/{statistics?.week.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statistics?.week.percentage}% present
                </p>
              </CardContent>
            </Card>
            <Card className="@container/card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <CalendarIcon className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics?.month.present}/{statistics?.month.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statistics?.month.percentage}% present
                </p>
              </CardContent>
            </Card>
            <Card className="@container/card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <User className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.total_members}</div>
                <p className="text-xs text-muted-foreground">Active members</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Attendance Records Table */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>Recent attendance records for members</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Filter by Date
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={dateFilter ? new Date(dateFilter) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setDateFilter(format(date, "yyyy-MM-dd"));
                        } else {
                          setDateFilter(undefined);
                        }
                      }}
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
                    <TableHead>Date</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Recorded By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm || dateFilter
                          ? "No records found matching your search."
                          : "No attendance records recorded yet."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {format(new Date(record.date), "MMM dd, yyyy")}
                        </TableCell>
                                              <TableCell>
                        <div className="font-medium">{record.member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {record.member.student_id ? record.member.student_id : `ID: ${record.member.id}`}
                          {record.member.email && ` | ${record.member.email}`}
                        </div>
                      </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={record.is_present ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {record.is_present ? "Hadir" : "Tidak Hadir"}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.notes || "-"}</TableCell>
                        <TableCell>{record.recorder.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewRecord(record)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {["koordinator", "staff"].includes(user.role) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditRecord(record)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteRecord(record)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Attendance Chart */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Weekly Attendance Summary</CardTitle>
              <Select defaultValue="this_week">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="last_week">Last Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingRecords ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toFixed(1)}%`, "Attendance Rate"]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar dataKey="percentage" name="Attendance Rate">
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.percentage >= 80 ? "#10B981" : entry.percentage >= 60 ? "#F59E0B" : "#EF4444"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
            <DialogDescription>
              Detailed information about this attendance record
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <p className="text-gray-600">
                    {format(new Date(selectedRecord.date), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge
                    variant="outline"
                    className={selectedRecord.is_present ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {selectedRecord.is_present ? "Hadir" : "Tidak Hadir"}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Member</Label>
                <p className="text-gray-600">{selectedRecord.member.name}</p>
                <p className="text-sm text-gray-500">
                  {selectedRecord.member.student_id ? `ID: ${selectedRecord.member.student_id}` : `Member ID: ${selectedRecord.member.id}`}
                  {selectedRecord.member.email && ` | ${selectedRecord.member.email}`}
                </p>
              </div>
              <div>
                <Label>Notes</Label>
                <p className="text-gray-600">{selectedRecord.notes || "-"}</p>
              </div>
              <div>
                <Label>Recorded By</Label>
                <p className="text-gray-600">{selectedRecord.recorder.name}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
            <DialogDescription>Update this attendance record</DialogDescription>
          </DialogHeader>
          <Form {...updateAttendanceForm}>
            <form
              onSubmit={updateAttendanceForm.handleSubmit(handleUpdateAttendance)}
              className="space-y-4"
            >
              <FormField
                control={updateAttendanceForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between font-normal"
                          >
                            {field.value
                              ? format(new Date(field.value), "MMM dd, yyyy")
                              : "Select date"}
                            <ChevronDownIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            defaultMonth={field.value ? new Date(field.value) : new Date()}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(format(date, "yyyy-MM-dd"));
                              }
                            }}
                            disabled={(date) =>
                              date.getFullYear() < 2020 || date.getFullYear() > 2100
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Label>Member</Label>
                <Select
                  onValueChange={(value) =>
                    updateAttendanceForm.setValue("member_id", value)
                  }
                  value={updateAttendanceForm.watch("member_id")}
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members?.map((member) => (
                      <SelectItem key={member.id} value={String(member.id)}>
                        {member.name}
                        {member.student_id ? ` - ${member.student_id}` : ` (ID: ${member.id})`}
                        {member.email && ` - ${member.email}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {updateAttendanceForm.formState.errors.member_id && (
                  <p className="text-sm text-red-500 mt-1">
                    {updateAttendanceForm.formState.errors.member_id.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  onValueChange={(value) =>
                    updateAttendanceForm.setValue("is_present", value === "true")
                  }
                  value={updateAttendanceForm.watch("is_present").toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Hadir</SelectItem>
                    <SelectItem value="false">Tidak Hadir</SelectItem>
                  </SelectContent>
                </Select>
                {updateAttendanceForm.formState.errors.is_present && (
                  <p className="text-sm text-red-500 mt-1">
                    {updateAttendanceForm.formState.errors.is_present.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  placeholder="Optional notes"
                  value={updateAttendanceForm.watch("notes") || ""}
                  onChange={(e) =>
                    updateAttendanceForm.setValue("notes", e.target.value || null)
                  }
                />
                {updateAttendanceForm.formState.errors.notes && (
                  <p className="text-sm text-red-500 mt-1">
                    {updateAttendanceForm.formState.errors.notes.message}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Attendance"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this attendance record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAttendance} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendancePage;