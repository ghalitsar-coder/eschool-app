"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { useAttendanceManagement } from "@/hooks/use-attendance";
import { AttendanceRecord } from "@/types/api";
import {
  AttendanceFormData,
  UpdateAttendanceFormData,
  updateAttendanceSchema,
} from "@/types/page/attendance";

// Components
import {
  HeaderAttendance,
  AttendanceStats,
  AttendanceFilters,
  AttendanceTable,
  AttendancePagination,
  DialogCreateAttendance,
  DialogViewAttendance,
  DialogUpdateAttendance,
  DialogDeleteAttendance,
  DialogExportAttendance,
} from "./components";

// Note: Export form is now handled internally by DialogExportAttendance

export default function AttendancePage() {
  const params = useParams();
  const eschoolId = params.eschoolId as string;

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string | undefined>(undefined);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null
  );

  // Hooks
  const {
    // Data
    records,
    members,
    statistics,
    pagination,
    // Loading states
    isLoadingRecords,
    isLoadingMembers,
    isLoadingStatistics,
    // Mutation states
    isCreating,
    isUpdating,
    isDeleting,
    isExporting,
    // Errors
    recordsError,
    membersError,
    statisticsError,
    createError,
    updateError,
    deleteError,
    // Actions
    createAttendance,
    updateAttendance,
    deleteAttendance,
    exportAttendance,
    refetchRecords,
    refetchStatistics,
  } = useAttendanceManagement(
    { period: "week" }, // analyticsParams
    {
      // filterParams
      page: currentPage,
      search: searchTerm,
      date: dateFilter,
    }
  );

  // Forms
  const updateForm = useForm<UpdateAttendanceFormData>({
    resolver: zodResolver(updateAttendanceSchema),
  });

  // Export form is now handled internally by DialogExportAttendance component

  const handleCreateAttendance = async (data: AttendanceFormData) => {
    try {
      // Prepare FormData for file uploads
      const formData = new FormData();
      formData.append("eschool_id", eschoolId);
      formData.append("date", data.date);

      // Add members data
      data.members.forEach((member, index) => {
        formData.append(`members[${index}][member_id]`, member.member_id);
        formData.append(
          `members[${index}][is_present]`,
          member.is_present ? "1" : "0"
        );
        if (member.notes) {
          formData.append(`members[${index}][notes]`, member.notes);
        }
        if (member.proof_document) {
          formData.append(
            `members[${index}][proof_document]`,
            member.proof_document
          );
        }
      });

      await createAttendance(formData as any); // Cast to any for FormData submission
      setIsCreateDialogOpen(false);
      toast.success("Attendance recorded successfully!");
    } catch (error: any) {
      console.error("Error creating attendance:", error);

      // Handle backend validation errors
      if (error?.response?.data?.errors) {
        const backendErrors = error.response.data.errors;

        // Handle duplicate attendance records specifically
        if (backendErrors.duplicate_records) {
          // Show the specific duplicate records error message
          toast.error(
            error?.response?.data?.message ||
              "Duplicate attendance records detected"
          );
        }
        // Handle other field validation errors
        else {
          // Display errors for each field
          Object.keys(backendErrors).forEach((fieldPath) => {
            const errorMessage = backendErrors[fieldPath];
            // Note: Form error handling will be done in the dialog component
          });

          // Also show a general toast error
          toast.error(
            "Failed to record attendance. Please check the form for errors."
          );
        }
      } else {
        // Handle other types of errors
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
    }
  };

  const handleUpdateAttendance = async (data: UpdateAttendanceFormData) => {
    if (!selectedRecord) return;

    try {
      const formData = new FormData();
      formData.append("is_present", data.is_present ? "1" : "0");
      if (data.notes) {
        formData.append("notes", data.notes);
      }
      if (data.proof_document) {
        formData.append("proof_document", data.proof_document);
      }

      await updateAttendance(selectedRecord.id, formData as any);
      setIsUpdateDialogOpen(false);
      setSelectedRecord(null);
      toast.success("Attendance record updated successfully!");
    } catch (error: any) {
      console.error("Error updating attendance:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update attendance record"
      );
    }
  };

  const handleExportAttendance = async (data: any) => {
    try {
      await exportAttendance({
        start_date: data.start_date,
        end_date: data.end_date,
        format: data.format,
      });
    } catch (error: unknown) {
      console.error("Error exporting attendance:", error);
      throw error; // Re-throw to let DialogExportAttendance handle the error display
    }
  };

  // Event handlers
  const handleViewRecord = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    updateForm.reset({
      is_present: record.is_present,
      notes: record.notes || "",
      proof_document: null,
    });
    setIsUpdateDialogOpen(true);
  };

  const handleDeleteRecord = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRecord) return;

    try {
      await deleteAttendance(selectedRecord.id);
      setIsDeleteDialogOpen(false);
      setSelectedRecord(null);
      toast.success("Attendance record deleted successfully!");
    } catch (error: unknown) {
      console.error("Error deleting attendance:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete attendance record"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="flex flex-col gap-6 py-6">
        {/* Header */}
        <HeaderAttendance />

        {/* Statistics Cards */}
        <AttendanceStats
          statistics={statistics}
          isLoadingStatistics={isLoadingStatistics}
        />

        {/* Filters */}
        <AttendanceFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          setCurrentPage={setCurrentPage}
          setIsCreateDialogOpen={setIsCreateDialogOpen}
          setShowExportDialog={setShowExportDialog}
        />

        {/* Attendance Records */}
        <AttendanceTable
          records={records}
          isLoadingRecords={isLoadingRecords}
          searchTerm={searchTerm}
          dateFilter={dateFilter}
          onViewRecord={handleViewRecord}
          onEditRecord={handleEditRecord}
          onDeleteRecord={handleDeleteRecord}
        />

        {/* Pagination */}
        <AttendancePagination
          currentPage={currentPage}
          totalPages={pagination?.totalPages || 1}
          onPageChange={setCurrentPage}
          isLoading={isLoadingRecords}
        />

        {/* Create Attendance Dialog */}
        <DialogCreateAttendance
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreateAttendance}
          members={members}
          isLoadingMembers={isLoadingMembers}
          isCreating={isCreating}
        />

        {/* View Attendance Dialog */}
        <DialogViewAttendance
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          record={selectedRecord}
        />

        {/* Update Attendance Dialog */}
        <DialogUpdateAttendance
          isOpen={isUpdateDialogOpen}
          onClose={() => setIsUpdateDialogOpen(false)}
          onSubmit={handleUpdateAttendance}
          record={selectedRecord}
          isUpdating={isUpdating}
        />

        {/* Delete Attendance Dialog */}
        <DialogDeleteAttendance
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          record={selectedRecord}
          isDeleting={isDeleting}
        />

        {/* Export Dialog */}
        <DialogExportAttendance
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          onSubmit={handleExportAttendance}
          isExporting={isExporting}
        />
      </div>
    </div>
  );
}
