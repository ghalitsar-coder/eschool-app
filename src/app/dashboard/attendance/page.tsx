"use client";

import { useState } from "react";
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
import { Badge, badgeVariants } from "@/components/ui/badge";
import {
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  Plus,
  Upload,
  Calendar as CalendarIcon,
  Users,
  FileText,
  Filter,
  Search,
  AlertCircle,
  Download,
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  AlertTriangle,
  ChevronDown,
  MoreHorizontal,
  Printer,
  Copy,
  Share2,
  RefreshCw,
  Loader2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  File as FileIcon,
  Image,
  Check,
  X,
  AlertCircle as AlertIcon,
  CheckCircle2,
  ChevronDownIcon,
  User,
} from "lucide-react";

import { Calendar } from "@/components/ui/calendar";

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
  LineChart,
  Line,
  PieChart,
  Pie,
  Legend,
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
import { Popover } from "@/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";

const attendanceSchema = z.object({
  date: z.string().min(1, "Date is required"),
  members: z
    .array(
      z.object({
        member_id: z.string().min(1, "Member is required"),
        is_present: z.boolean(),
        notes: z.string().nullable(),
        proof_document: z.any().optional(), // Use z.any() for File handling
      })
    )
    .min(1, "At least one member is required"),
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
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [analyticsPeriod, setAnalyticsPeriod] = useState("week");
  const [exportFilters, setExportFilters] = useState({
    format: "csv",
    exportType: "monthly",
    month: "",
    year: "",
    date_from: "",
    date_to: "",
  });

  // Page change handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Server-side filtering params
  const filterParams = {
    search: searchTerm || undefined,
    date: dateFilter || undefined,
    page: currentPage,
    per_page: 10,
  };

  const {
    records,
    meta,
    statistics,
    analytics,
    members,
    isLoadingRecords,
    isLoadingStatistics,
    isLoadingAnalytics,
    isLoadingMembers,
    isCreating,
    isUpdating,
    isDeleting,
    recordsError,
    statisticsError,
    analyticsError,
    membersError,
    createError,
    updateError,
    deleteError,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    exportRecords,
    refetchRecords,
    refetchStatistics,
    refetchAnalytics,
  } = useAttendanceManagement({ period: analyticsPeriod }, filterParams);
  console.log(`🚀 ~ page.tsx:156 ~ members:`, members);

  const attendanceForm = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      members: [{ member_id: "", is_present: true, notes: null }],
    },
  });
  console.log(
    `🚀 ~ page.tsx:211 ~ attendanceForm: ERROR`,
    attendanceForm.formState.errors
  );

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
      // Prepare FormData for file uploads
      const formData = new FormData();

      if (!user || !user.eschool_id) {
        toast("Error User tidak ditemukan");
        return;
      }

      // Add basic fields
      formData.append("eschool_id", String(user?.eschool_id));
      formData.append("date", data.date);

      // Process members data
      data.members.forEach((member, index) => {
        formData.append(`members[${index}][member_id]`, member.member_id);
        formData.append(
          `members[${index}][is_present]`,
          member.is_present ? "1" : "0"
        );
        if (member.notes) {
          formData.append(`members[${index}][notes]`, member.notes);
        }

        // Handle file upload for absent members with proper type checking
        if (!member.is_present && member.proof_document && 
            typeof member.proof_document === 'object' && 
            'size' in member.proof_document && 
            'type' in member.proof_document) {
          formData.append(
            `members[${index}][proof_document]`,
            member.proof_document as File
          );
        }
      });

      await createAttendance(formData as any); // Cast to any for FormData submission
      attendanceForm.reset();
      setIsCreateDialogOpen(false);
      refetchRecords();
      refetchStatistics();
      refetchAnalytics();
      toast.success("Attendance recorded successfully");
    } catch (error: any) {
      console.error("Error creating attendance:", error);

      // Handle validation errors from backend
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred";
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
      refetchAnalytics();
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
      refetchAnalytics();
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
    updateAttendanceForm.setValue(
      "member_id",
      record.member.user_id.toString()
    );
    updateAttendanceForm.setValue("is_present", record.is_present);
    updateAttendanceForm.setValue("notes", record.notes || "");
    updateAttendanceForm.setValue(
      "date",
      record.date.split("T")[0] || record.date
    );
    setIsEditDialogOpen(true);
  };

  const handleDeleteRecord = (record: any) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  // New export function using the hook
  const handleExportWithHook = async () => {
    try {
      // Handle export based on exportType
      const exportParams: any = {
        format: exportFilters.format as "csv", // Only CSV for now
      };

      // Handle export based on exportType
      if (exportFilters.exportType === "monthly") {
        // For monthly export, we need to construct date_from and date_to
        if (exportFilters.month && exportFilters.year) {
          const year = parseInt(exportFilters.year);
          const month = parseInt(exportFilters.month);

          // First day of the month
          exportParams.start_date = `${year}-${String(month).padStart(
            2,
            "0"
          )}-01`;

          // Last day of the month
          const lastDay = new Date(year, month, 0).getDate();
          exportParams.end_date = `${year}-${String(month).padStart(
            2,
            "0"
          )}-${String(lastDay).padStart(2, "0")}`;
        }
      } else {
        // For custom date range export
        if (exportFilters.date_from) {
          exportParams.start_date = exportFilters.date_from;
        }

        if (exportFilters.date_to) {
          exportParams.end_date = exportFilters.date_to;
        }
      }

      await exportRecords(exportParams);
      setIsExportDialogOpen(false);
      toast.success("Export completed successfully");
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(`Export failed: ${error?.message || "Unknown error"}`);
    }
  };

  // Server-side filtering, no need for client-side filtering
  // Records are already filtered by the server based on filterParams

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow">
          <p className="font-bold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const hasErrors =
    recordsError ||
    statisticsError ||
    analyticsError ||
    membersError ||
    createError ||
    updateError ||
    deleteError;

  if (!user) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Attendance Management
              </h1>
              <p className="text-muted-foreground">
                Track and manage member attendance
              </p>
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
            <h1 className="text-2xl font-bold tracking-tight">
              Attendance Management
            </h1>
            <p className="text-muted-foreground">
              Track and manage member attendance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportDialogOpen(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {["koordinator", "staff"].includes(user.role) && (
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Attendance
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Record Attendance</DialogTitle>
                    <DialogDescription>
                      Record attendance for members on a specific date
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...attendanceForm}>
                    <form
                      onSubmit={attendanceForm.handleSubmit(
                        handleCreateAttendance
                      )}
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
                                      ? format(
                                          new Date(field.value),
                                          "MMM dd, yyyy"
                                        )
                                      : "Select date"}
                                    <ChevronDownIcon className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={
                                      field.value
                                        ? new Date(field.value)
                                        : undefined
                                    }
                                    defaultMonth={
                                      field.value
                                        ? new Date(field.value)
                                        : new Date()
                                    }
                                    captionLayout="dropdown"
                                    onSelect={(date) => {
                                      if (date) {
                                        field.onChange(
                                          format(date, "yyyy-MM-dd")
                                        );
                                      }
                                    }}
                                    disabled={(date) =>
                                      date.getFullYear() < 2020 ||
                                      date.getFullYear() > 2100
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
                        <h3 className="text-lg font-semibold mb-4">
                          Member Attendance
                        </h3>
                        {attendanceForm.formState.errors.root?.message && (
                          <ul className="text-red-500 text-sm mb-4">
                            {(Array.isArray(
                              attendanceForm.formState.errors.root?.message
                            )
                              ? attendanceForm.formState.errors.root.message
                              : [attendanceForm.formState.errors.root?.message]
                            ).map((msg, idx) => (
                              <li key={idx}>❌ {msg}</li>
                            ))}
                          </ul>
                        )}

                        <div className="space-y-4">
                          {fields.map((field, index) => {
                            const memberIds = watchedMembers
                              .map((m) => m.member_id)
                              .filter((id) => id !== "");
                            const currentMemberId =
                              watchedMembers[index]?.member_id || "";
                            const isAbsent = !watchedMembers[index]?.is_present;

                            return (
                              <Card key={field.id} className="p-4">
                                <div className="space-y-2.5">
                                  <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4">
                                    {/* Member Selection */}
                                    <div className="space-y-2 w-full">
                                      <Label className="text-sm font-medium">
                                        Member
                                      </Label>
                                      <FormField
                                        control={attendanceForm.control}
                                        name={`members.${index}.member_id`}
                                        render={({ field }) => (
                                          <FormItem className="w-full">
                                            <FormControl>
                                              <Select
                                                onValueChange={(value) =>
                                                  field.onChange(value)
                                                }
                                                value={
                                                  field.value
                                                    ? String(field.value)
                                                    : ""
                                                }
                                              >
                                                <SelectTrigger className="w-full">
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
                                                      memberIds.includes(
                                                        String(member.user_id)
                                                      ) &&
                                                      String(member.user_id) !==
                                                        currentMemberId;

                                                    return (
                                                      <SelectItem
                                                        key={member.user_id}
                                                        value={String(
                                                          member.user_id
                                                        )}
                                                        disabled={isUsed}
                                                      >
                                                        {member.name}
                                                        {member.student_id &&
                                                        member.student_id !==
                                                          "N/A"
                                                          ? ` - ${member.student_id}`
                                                          : ` (ID: ${member.user_id})`}
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
                                    </div>

                                    {/* Status Selection */}
                                    <div className="space-y-2 w-full">
                                      <Label className="text-sm font-medium">
                                        Status
                                      </Label>
                                      <FormField
                                        control={attendanceForm.control}
                                        name={`members.${index}.is_present`}
                                        render={({ field }) => (
                                          <FormItem className="w-full">
                                            <FormControl>
                                              <Select
                                                onValueChange={(value) =>
                                                  field.onChange(
                                                    value === "true"
                                                  )
                                                }
                                                value={field.value.toString()}
                                              >
                                                <SelectTrigger className="w-full">
                                                  <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="true">
                                                    Hadir
                                                  </SelectItem>
                                                  <SelectItem value="false">
                                                    Tidak Hadir
                                                  </SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2 w-full ">
                                      <Label className="text-sm font-medium">
                                        Notes
                                      </Label>
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
                                                  field.onChange(
                                                    e.target.value || null
                                                  )
                                                }
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>

                                    {/* Remove Button */}
                                    <div className="flex items-end justify-center">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4 " />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Proof Document - Only show when absent */}
                                  {isAbsent && (
                                    <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                      <Label className="text-sm font-medium">
                                        Proof Document{" "}
                                        <span className="text-red-500">*</span>
                                      </Label>
                                      <FormField
                                        control={attendanceForm.control}
                                        name={`members.${index}.proof_document`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormControl>
                                              <div className="space-y-2">
                                                <Input
                                                  type="file"
                                                  accept=".pdf,.jpg,.jpeg,.png"
                                                  onChange={(e) => {
                                                    const file =
                                                      e.target.files?.[0] ||
                                                      null;
                                                    field.onChange(file);
                                                  }}
                                                  className="text-sm"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                  Required for absent members
                                                  (PDF, JPG, JPEG, PNG, Max 5MB)
                                                </p>
                                              </div>
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  )}
                                </div>
                              </Card>
                            );
                          })}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            append({
                              member_id: "",
                              is_present: true,
                              notes: null,
                            })
                          }
                          className="mt-4 w-full"
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
              {statisticsError && (
                <div>Statistics: {statisticsError.message}</div>
              )}
              {analyticsError && <div>Analytics: {analyticsError.message}</div>}
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
                <CardTitle className="text-sm font-medium">
                  Today&apos;s Attendance
                </CardTitle>
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
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
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
                <CardTitle className="text-sm font-medium">
                  Total Members
                </CardTitle>
                <User className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics?.total_members}
                </div>
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
                <CardDescription>
                  Recent attendance records for members
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset page when searching
                    }}
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
                        setCurrentPage(1); // Reset page when date filter changes
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
                    setCurrentPage(1); // Reset page when clearing filters
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
                    <TableHead>Berkas / File</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Recorded By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchTerm || dateFilter
                          ? "No records found matching your search."
                          : "No attendance records recorded yet."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    records?.map((record) => {
                      console.log(`🚀 ~ page.tsx:1028 ~ record:`, record);

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
                              {record.member.role_in_eschool &&
                                ` [${record.member.role_in_eschool}]`}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                record.is_present ? "default" : "destructive"
                              }
                              className={
                                record.is_present
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-red-100 text-red-800 hover:bg-red-100"
                              }
                            >
                              {record.is_present ? "Hadir" : "Tidak Hadir"}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            {record.proof_document_path ? (
                              <a
                                href={`http://localhost:8000/storage/${record.proof_document_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Document
                              </a>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {record.notes || (
                              <span className="italic text-xs text-gray-400">
                                Tidak ada catatan
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.recorder.name || (
                              <span className="italic text-xs text-gray-400">
                                Nama tidak ditemukan
                              </span>
                            )}
                          </TableCell>
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
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {/* Pagination */}
          {meta && meta.total > 0 && (
            <CardContent className="pt-0">
              <div className="flex items-center justify-between px-2">
                <div className="flex-1 text-sm text-muted-foreground">
                  Showing {meta.from} to {meta.to} of {meta.total} entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!meta.has_prev_page}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-1">
                    {/* Page numbers */}
                    {Array.from(
                      { length: Math.min(5, meta.last_page) },
                      (_, i) => {
                        let page;
                        if (meta.last_page <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= meta.last_page - 2) {
                          page = meta.last_page - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={page}
                            variant={
                              page === currentPage ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      }
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!meta.has_next_page}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Attendance Analytics</CardTitle>
              <Select
                value={analyticsPeriod}
                onValueChange={(value) => setAnalyticsPeriod(value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="semester">Last 6 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              Comprehensive attendance analytics and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
              <div className="h-96 flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Overall Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Overall Rate
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics?.overall?.attendance_rate ?? 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Average attendance rate
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Present
                      </CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics?.overall?.total_present ?? 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Members present
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Members
                      </CardTitle>
                      <Users className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics?.overall?.total_members ?? 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Active members
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Sessions
                      </CardTitle>
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics?.overall?.total_possible ?? 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total attendance sessions
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Daily Attendance Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Attendance Overview</CardTitle>
                      <CardDescription>
                        Attendance trends over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analytics?.daily_summary || []}
                          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="formatted_date"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar
                            dataKey="present"
                            name="Present"
                            fill="#10B981"
                          />
                          <Bar dataKey="absent" name="Absent" fill="#EF4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Member Attendance Rate Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Members</CardTitle>
                      <CardDescription>
                        Members with highest attendance rates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analytics?.member_attendance || []}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={90}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip
                            formatter={(value) => [
                              `${value}%`,
                              "Attendance Rate",
                            ]}
                            labelFormatter={(value) => `Member: ${value}`}
                          />
                          <Bar
                            dataKey="attendance_rate"
                            name="Attendance Rate"
                            fill="#3B82F6"
                          >
                            {analytics?.member_attendance?.map(
                              (entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    entry.attendance_rate >= 90
                                      ? "#10B981"
                                      : entry.attendance_rate >= 75
                                      ? "#F59E0B"
                                      : "#EF4444"
                                  }
                                />
                              )
                            )}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Weekday Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Weekday Attendance Analysis</CardTitle>
                    <CardDescription>
                      Average attendance rates by day of the week
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analytics?.weekday_analysis || []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="short_day" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip
                          formatter={(value) => [
                            `${value}%`,
                            "Attendance Rate",
                          ]}
                          labelFormatter={(value) => `Day: ${value}`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="average_attendance_rate"
                          name="Attendance Rate"
                          stroke="#8B5CF6"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
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
                    className={
                      selectedRecord.is_present
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {selectedRecord.is_present ? "Hadir" : "Tidak Hadir"}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Member</Label>
                <p className="text-gray-600">{selectedRecord.member.name}</p>
                <p className="text-sm text-gray-500">
                  {selectedRecord.member.student_id &&
                  selectedRecord.member.student_id !== "N/A"
                    ? `ID: ${selectedRecord.member.student_id}`
                    : `Member ID: ${selectedRecord.member.user_id}`}
                  {selectedRecord.member.email &&
                    ` | ${selectedRecord.member.email}`}
                  {selectedRecord.member.role_in_eschool &&
                    ` [${selectedRecord.member.role_in_eschool}]`}
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
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
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
              onSubmit={updateAttendanceForm.handleSubmit(
                handleUpdateAttendance
              )}
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
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            defaultMonth={
                              field.value ? new Date(field.value) : new Date()
                            }
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(format(date, "yyyy-MM-dd"));
                              }
                            }}
                            disabled={(date) =>
                              date.getFullYear() < 2020 ||
                              date.getFullYear() > 2100
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
                      <SelectItem
                        key={member.user_id}
                        value={String(member.user_id)}
                      >
                        {member.name}
                        {member.student_id && member.student_id !== "N/A"
                          ? ` - ${member.student_id}`
                          : ` (ID: ${member.user_id})`}
                        {member.email && ` - ${member.email}`}
                        {member.role_in_eschool &&
                          ` [${member.role_in_eschool}]`}
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
                    updateAttendanceForm.setValue(
                      "is_present",
                      value === "true"
                    )
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
                    updateAttendanceForm.setValue(
                      "notes",
                      e.target.value || null
                    )
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
              Are you sure you want to delete this attendance record? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAttendance}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Attendance Records</DialogTitle>
            <DialogDescription>
              Export your attendance records to a CSV file.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Export Options - Monthly or Custom Date Range */}
            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Export By
              </label>
              <Select
                value={exportFilters.exportType || "monthly"}
                onValueChange={(value) =>
                  setExportFilters({
                    ...exportFilters,
                    exportType: value,
                    date_from: "",
                    date_to: "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select export type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Monthly Export */}
            {exportFilters.exportType === "monthly" && (
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Select Month & Year
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={exportFilters.month || ""}
                    onValueChange={(value) =>
                      setExportFilters({ ...exportFilters, month: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Select
                    value={exportFilters.year || ""}
                    onValueChange={(value) =>
                      setExportFilters({ ...exportFilters, year: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: 10 },
                        (_, i) => new Date().getFullYear() - 5 + i
                      ).map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Custom Date Range */}
            {exportFilters.exportType === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    From Date
                  </label>
                  <Input
                    type="date"
                    value={exportFilters.date_from}
                    onChange={(e) =>
                      setExportFilters({
                        ...exportFilters,
                        date_from: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    To Date
                  </label>
                  <Input
                    type="date"
                    value={exportFilters.date_to}
                    onChange={(e) =>
                      setExportFilters({
                        ...exportFilters,
                        date_to: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Format
              </label>
              <Select
                value={exportFilters.format}
                onValueChange={(value) =>
                  setExportFilters({ ...exportFilters, format: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleExportWithHook}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendancePage;
