"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { AttendanceRecord } from "@/types/api";
import {
  UpdateAttendanceFormData,
  updateAttendanceSchema,
} from "@/types/page/attendance";

interface DialogUpdateAttendanceProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateAttendanceFormData) => Promise<void>;
  record: AttendanceRecord | null;
  isUpdating: boolean;
}

const DialogUpdateAttendance: React.FC<DialogUpdateAttendanceProps> = ({
  isOpen,
  onClose,
  onSubmit,
  record,
  isUpdating,
}) => {
  const form = useForm<UpdateAttendanceFormData>({
    resolver: zodResolver(updateAttendanceSchema),
    defaultValues: {
      is_present: record?.is_present || false,
      notes: record?.notes || "",
      proof_document: null,
    },
  });

  const watchedIsPresent = form.watch("is_present");

  React.useEffect(() => {
    if (record) {
      form.reset({
        is_present: record.is_present,
        notes: record.notes || "",
        proof_document: null,
      });
    }
  }, [record, form]);

  const handleSubmit = async (data: UpdateAttendanceFormData) => {
    await onSubmit(data);
    form.reset();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Attendance</DialogTitle>
          <DialogDescription>
            Update attendance record for {record.member.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Date:</strong>{" "}
                {new Date(record.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Member:</strong> {record.member.name}
              </p>
            </div>

            <FormField
              control={form.control}
              name="is_present"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attendance Status</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                      value={field.value ? "true" : "false"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select attendance status" />
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes about this attendance record..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="proof_document"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>
                    Proof Document{" "}
                    {!watchedIsPresent && "(Required for absence)"}
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          onChange(file || null);
                        }}
                        disabled={watchedIsPresent}
                        {...field}
                      />
                      {!watchedIsPresent && (
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {watchedIsPresent
                      ? "Proof document not required for present attendance"
                      : "Upload proof document for absence (image or PDF)"}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUpdating}
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
  );
};

export default DialogUpdateAttendance;
