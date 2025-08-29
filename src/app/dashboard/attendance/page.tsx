"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useForm,
  useFieldArray,
  FormProvider,
  useWatch,
} from "react-hook-form";
import { useAuthStore } from "@/lib/stores/auth";
import {
  useAttendance,
  useCreateAttendance,
  useAttendanceStatistics,
} from "@/hooks/use-attendance";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "recharts";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useMembers } from "@/hooks/use-kas";
import { toast } from "sonner";

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
  const { user, token } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const memberIdFromQuery = searchParams.get("member");

  const eschoolId = user?.eschool_id;

  const {
    data: attendanceRecords,
    isLoading: attendanceLoading,
    error: attendanceError,
    refetch,
  } = useAttendance({});

  const { data: membersData, isLoading: membersLoading } = useMembers();
  const { data: statsData, isLoading: statsLoading } =
    useAttendanceStatistics();
  const createAttendanceMutation = useCreateAttendance();
  const members = membersData?.members || [];

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

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

  const dateWatched = useWatch({
    control: attendanceForm.control,
    name: "date",
  });
  const watchedMembers = useWatch({
    control: attendanceForm.control,
    name: "members",
  });

  const handleCreateAttendance = async (data: AttendanceFormData) => {
    try {
      await createAttendanceMutation.mutateAsync(data);
      attendanceForm.reset();
      setIsCreateDialogOpen(false);
      refetch();
      toast("Attendance recorded successfully",{
        description: "Attendance recorded successfully",
      });
    } catch (error: unknown) {
      const err = error as any;
      const errors = err.response?.data?.messages || [
        err.response?.data?.message || "Gagal mencatat absensi",
      ];
      attendanceForm.setError("root", {
        type: "server",
        message: errors,
      });
    }
  };

  const handleViewRecord = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(`${apiUrl}/attendance/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch attendance record");
      }
      const data = await response.json();
      setSelectedRecord(data.data);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error("Error fetching record:", error);
      toast("Failed to fetch attendance record",{
        // description: "Failed to fetch attendance record",
        // variant: "destructive",
      });
    }
  };

  const handleEditRecord = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(`${apiUrl}/attendance/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch attendance record");
      }
      const data = await response.json();
      setSelectedRecord(data.data);
      updateAttendanceForm.setValue("member_id", data.data.member_id);
      updateAttendanceForm.setValue("is_present", data.data.is_present);
      updateAttendanceForm.setValue("notes", data.data.notes || "");
      updateAttendanceForm.setValue("date", data.data.date.split(" ")[0]);
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error("Error fetching record for edit:", error);
      toast("Failed to fetch attendance record for editing",{
        // title: "Error",
        // description: "Failed to fetch attendance record for editing",
        // variant: "destructive",
      });
    }
  };

  const handleUpdateAttendance = async (data: UpdateAttendanceFormData) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(
        `${apiUrl}/attendance/${selectedRecord.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            eschool_id: eschoolId,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update attendance");
      }
      setIsEditDialogOpen(false);
      refetch();
      toast("Attendance record updated successfully",{
        // title: "Success",
        // description: "Attendance record updated successfully",
      });
    } catch (error: unknown) {
      console.error("Error updating record:", error);
      toast("Failed to update attendance",{
        // title: "Error",
        // description:
        //   error instanceof Error
        //     ? error.message
        //     : "Failed to update attendance",
        // variant: "destructive",
      });
    }
  };

  const handleDeleteRecord = async (id: string) => {
    setSelectedRecord({ id });
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRecord = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(
        `${apiUrl}/attendance/${selectedRecord.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete attendance");
      }
      setIsDeleteDialogOpen(false);
      refetch();
      // toast({
      //   title: "Success",
      //   description: "Attendance record deleted successfully",
      // });
    } catch (error: unknown) {
      console.error("Error deleting record:", error);
      // toast({
      //   title: "Error",
      //   description:
      //     error instanceof Error
      //       ? error.message
      //       : "Failed to delete attendance",
      //   variant: "destructive",
      // });
    }
  };

  const handleExportExcel = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(
        `${apiUrl}/eschools/${eschoolId}/attendance/export/excel`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to export Excel: ${response.status} - ${errorText}`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_records_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      // toast({
      //   title: "Error",
      //   description: error instanceof Error ? error.message : "Unknown error",
      //   variant: "destructive",
      // });
    }
  };

  const handleExportPDF = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(
        `${apiUrl}/eschools/${eschoolId}/attendance/export/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to export PDF: ${response.status} - ${errorText}`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_records_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      // toast({
      //   title: "Error",
      //   description: error instanceof Error ? error.message : "Unknown error",
      //   variant: "destructive",
      // });
    }
  };

  const filteredAttendance = useMemo(() => {
    return memberIdFromQuery &&
      attendanceRecords &&
      Array.isArray(attendanceRecords)
      ? attendanceRecords.filter(
          (record) => record.member_id === memberIdFromQuery
        )
      : attendanceRecords && Array.isArray(attendanceRecords)
      ? attendanceRecords
      : [];
  }, [attendanceRecords, memberIdFromQuery]);

  const chartData = useMemo(() => {
    if (!attendanceRecords || !Array.isArray(attendanceRecords)) return [];
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const records = attendanceRecords.filter(
        (r) => new Date(r.date).toDateString() === date.toDateString()
      );
      const present = records.filter((r) => r.is_present).length;
      const total = records.length || members.length;
      return {
        date: format(date, "MMM d"),
        percentage: total ? (present / total) * 100 : 0,
      };
    });
    return days;
  }, [attendanceRecords, members]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Kelola Absensi
                {memberIdFromQuery && members && (
                  <span className="text-sm text-gray-600 ml-2">
                    - {members.find((m) => m.id === memberIdFromQuery)?.name}
                  </span>
                )}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/attendance/analytics")}
                className="bg-blue-50 border-blue-200 hover:bg-blue-100"
              >
                <BarChart3 className="mr-2 h-4 w-4 text-blue-600" />
                Analytics
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportExcel}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {["koordinator", "staff"].includes(user.role) && (
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Catat Absensi
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Catat Absensi</DialogTitle>
                      <DialogDescription>
                        Catat kehadiran anggota untuk hari ini
                      </DialogDescription>
                    </DialogHeader>
                    <FormProvider {...attendanceForm}>
                      <form
                        onSubmit={attendanceForm.handleSubmit(
                          handleCreateAttendance
                        )}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="date">Tanggal</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between font-normal"
                              >
                                {dateWatched
                                  ? format(new Date(dateWatched), "MMM d, yyyy")
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
                                  dateWatched
                                    ? new Date(dateWatched)
                                    : undefined
                                }
                                defaultMonth={
                                  dateWatched
                                    ? new Date(dateWatched)
                                    : new Date()
                                }
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                  if (date) {
                                    attendanceForm.setValue(
                                      "date",
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
                          {attendanceForm.formState.errors.date && (
                            <p className="text-sm text-red-500 mt-1">
                              {attendanceForm.formState.errors.date.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Member Attendance
                          </h3>
                          {attendanceForm.formState.errors.root?.message && (
                            <ul className="text-red-500 text-sm mt-2">
                              {(Array.isArray(
                                attendanceForm.formState.errors.root?.message
                              )
                                ? attendanceForm.formState.errors.root.message
                                : [
                                    attendanceForm.formState.errors.root
                                      ?.message,
                                  ]
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
                              {fields.map((field, index) => (
                                <TableRow key={field.id}>
                                  <TableCell>
                                    <FormField
                                      control={attendanceForm.control}
                                      name={`members.${index}.member_id`}
                                      render={({ field }) => (
                                        <FormItem>
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
                                              <SelectTrigger>
                                                <SelectValue
                                                  placeholder={
                                                    membersLoading
                                                      ? "Loading members..."
                                                      : "Select a member"
                                                  }
                                                />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {members.map((member) => {
                                                  const memberIds =
                                                    watchedMembers.map(
                                                      (m) => m.member_id
                                                    );
                                                  const isUsed =
                                                    memberIds.includes(
                                                      String(member.id)
                                                    ) &&
                                                    String(member.id) !==
                                                      field.value;

                                                  return (
                                                    <SelectItem
                                                      key={member.id}
                                                      value={String(member.id)}
                                                      disabled={isUsed}
                                                    >
                                                      {member.name}
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
                              ))}
                            </TableBody>
                          </Table>
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
                            Batal
                          </Button>
                          <Button
                            type="submit"
                            disabled={
                              createAttendanceMutation.isPending ||
                              watchedMembers.some((member) => !member.member_id)
                            }
                          >
                            {createAttendanceMutation.isPending
                              ? "Menyimpan..."
                              : "Simpan"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </FormProvider>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">
                    Today&apos;s Attendance
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {statsLoading
                      ? "..."
                      : `${statsData?.today.present}/${statsData?.today.total}`}
                  </h3>
                  <p className="text-green-500 text-sm mt-1">
                    {statsLoading
                      ? "..."
                      : `${statsData?.today.percentage}% Present`}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">This Week</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {statsLoading
                      ? "..."
                      : `${statsData?.week.present}/${statsData?.week.total}`}
                  </h3>
                  <p className="text-blue-500 text-sm mt-1">
                    {statsLoading
                      ? "..."
                      : `${statsData?.week.percentage}% Present`}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <CalendarIcon className="text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">This Month</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {statsLoading
                      ? "..."
                      : `${statsData?.month.present}/${statsData?.month.total}`}
                  </h3>
                  <p className="text-yellow-500 text-sm mt-1">
                    {statsLoading
                      ? "..."
                      : `${statsData?.month.percentage}% Present`}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <CalendarIcon className="text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Members</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {statsLoading ? "..." : statsData?.total_members}
                  </h3>
                  <p className="text-indigo-500 text-sm mt-1">Active</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="text-indigo-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Record Attendance</CardTitle>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-48 justify-between font-normal"
                      >
                        {dateWatched
                          ? format(new Date(dateWatched), "MMM d, yyyy")
                          : "Select date"}
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          dateWatched ? new Date(dateWatched) : undefined
                        }
                        defaultMonth={
                          dateWatched ? new Date(dateWatched) : new Date()
                        }
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          if (date) {
                            attendanceForm.setValue(
                              "date",
                              format(date, "yyyy-MM-dd")
                            );
                          }
                        }}
                        disabled={(date) =>
                          date.getFullYear() < 2020 || date.getFullYear() > 2100
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="outline"
                    onClick={() =>
                      attendanceForm.resetField("members", {
                        defaultValue: [
                          { member_id: "", is_present: true, notes: null },
                        ],
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  disabled={membersLoading || !members.length}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-between bg-indigo-50 hover:bg-indigo-100"
                  onClick={() => router.push("/members/add")}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Plus className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="font-medium">Add New Member</span>
                  </div>
                  <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-green-50 hover:bg-green-100"
                  onClick={handleExportExcel}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium">Export Report</span>
                  </div>
                  <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-blue-50 hover:bg-blue-100"
                  onClick={() => router.push("/dashboard/attendance/analytics")}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium">View Statistics</span>
                  </div>
                  <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-purple-50 hover:bg-purple-100"
                  onClick={() => router.push("/dashboard/attendance/history")}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium">Attendance History</span>
                  </div>
                  <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Attendance Records</CardTitle>
                <CardDescription>
                  Daftar catatan kehadiran anggota
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" aria-label="Filter records">
                  <Filter className="h-4 w-4 text-indigo-600" />
                </Button>
                <Button variant="ghost" size="sm" aria-label="More options">
                  <MoreVertical className="h-4 w-4 text-indigo-600" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {attendanceLoading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
                <p className="mt-2 text-gray-600">Memuat data absensi...</p>
              </div>
            ) : attendanceError ? (
              <div className="text-center py-6">
                <p className="text-red-600">Error: {attendanceError.message}</p>
              </div>
            ) : filteredAttendance.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {format(new Date(record.date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{record.member_name || "Unknown"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              record.is_present
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {record.is_present ? "Hadir" : "Tidak Hadir"}
                          </span>
                        </TableCell>
                        <TableCell>{record.notes || "-"}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewRecord(record.id)}
                              aria-label="View record"
                            >
                              <Eye className="h-4 w-4 text-indigo-600" />
                            </Button>
                            {["koordinator", "staff"].includes(user.role) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditRecord(record.id)}
                                  aria-label="Edit record"
                                >
                                  <Edit className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteRecord(record.id)}
                                  aria-label="Delete record"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">
                      {filteredAttendance.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredAttendance.length}
                    </span>{" "}
                    records
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-indigo-600 text-white"
                    >
                      1
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum ada catatan absensi
                </h3>
                <p className="text-gray-600 mb-6">
                  {memberIdFromQuery
                    ? "Anggota ini belum memiliki catatan absensi"
                    : "Mulai dengan mencatat absensi pertama Anda"}
                </p>
                {["koordinator", "staff"].includes(user.role) && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Catat Absensi Pertama
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
                  <SelectItem value="last_month">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${Math.round(value)}%`} />
                  <Bar dataKey="percentage" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detail Absensi</DialogTitle>
              <DialogDescription>
                Informasi lengkap tentang catatan absensi
              </DialogDescription>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                <div>
                  <Label>Tanggal</Label>
                  <p className="text-gray-600">
                    {format(new Date(selectedRecord.date), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <Label>Anggota</Label>
                  <p className="text-gray-600">
                    {selectedRecord.member?.user?.name || "Unknown"}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p
                    className={`text-sm font-semibold ${
                      selectedRecord.is_present
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedRecord.is_present ? "Hadir" : "Tidak Hadir"}
                  </p>
                </div>
                <div>
                  <Label>Catatan</Label>
                  <p className="text-gray-600">{selectedRecord.notes || "-"}</p>
                </div>
                <div>
                  <Label>Pencatat</Label>
                  <p className="text-gray-600">
                    {selectedRecord.recorder?.name || "Unknown"}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Absensi</DialogTitle>
              <DialogDescription>Perbarui catatan absensi</DialogDescription>
            </DialogHeader>
            <FormProvider {...updateAttendanceForm}>
              <form
                onSubmit={updateAttendanceForm.handleSubmit(
                  handleUpdateAttendance
                )}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="date">Tanggal</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between font-normal"
                      >
                        {updateAttendanceForm.watch("date")
                          ? format(
                              new Date(updateAttendanceForm.watch("date")),
                              "MMM d, yyyy"
                            )
                          : "Select date"}
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          updateAttendanceForm.watch("date")
                            ? new Date(updateAttendanceForm.watch("date"))
                            : undefined
                        }
                        defaultMonth={
                          updateAttendanceForm.watch("date")
                            ? new Date(updateAttendanceForm.watch("date"))
                            : new Date()
                        }
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          if (date) {
                            updateAttendanceForm.setValue(
                              "date",
                              format(date, "yyyy-MM-dd")
                            );
                          }
                        }}
                        disabled={(date) =>
                          date.getFullYear() < 2020 || date.getFullYear() > 2100
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {updateAttendanceForm.formState.errors.date && (
                    <p className="text-sm text-red-500 mt-1">
                      {updateAttendanceForm.formState.errors.date.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Anggota</Label>
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
                      {members.map((member) => (
                        <SelectItem key={member.id} value={String(member.id)}>
                          {member.name}
                          {member.student_id ? ` - ${member.student_id}` : ""}
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
                  <Label>Catatan</Label>
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
                    Batal
                  </Button>
                  <Button type="submit">Simpan</Button>
                </DialogFooter>
              </form>
            </FormProvider>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus catatan absensi ini? Tindakan
                ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Batal
              </Button>
              <Button variant="destructive" onClick={confirmDeleteRecord}>
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AttendancePage;
