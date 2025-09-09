"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AttendanceFormData, attendanceSchema } from "@/types/page/attendance";
import { AttendanceMember } from "@/types/api";

interface DialogCreateAttendanceProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AttendanceFormData) => Promise<void>;
  members: AttendanceMember[] | undefined;
  isLoadingMembers: boolean;
  isCreating: boolean;
}

const DialogCreateAttendance: React.FC<DialogCreateAttendanceProps> = ({
  isOpen,
  onClose,
  onSubmit,
  members,
  isLoadingMembers,
  isCreating,
}) => {
  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      members: [
        {
          member_id: "",
          is_present: true,
          notes: "",
          proof_document: null,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  });

  const watchedMembers = form.watch("members");

  const handleSubmit = async (data: AttendanceFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Attendance</DialogTitle>
          <DialogDescription>
            Record attendance for multiple members on a specific date.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <h3 className="text-lg font-semibold mb-2">Members Attendance</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Proof Document</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`members.${index}.member_id`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
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
                                        const isAlreadySelected =
                                          watchedMembers.some(
                                            (m, i) =>
                                              i !== index &&
                                              m.member_id ===
                                                String(member.user_id)
                                          );

                                        return (
                                          <SelectItem
                                            key={member.user_id}
                                            value={String(member.user_id)}
                                            disabled={isAlreadySelected}
                                          >
                                            {member.name}
                                            {isAlreadySelected
                                              ? " (Selected)"
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
                            control={form.control}
                            name={`members.${index}.is_present`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Select
                                    onValueChange={(value) =>
                                      field.onChange(value === "true")
                                    }
                                    value={field.value ? "true" : "false"}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Status" />
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
                            control={form.control}
                            name={`members.${index}.notes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea
                                    placeholder="Optional notes..."
                                    className="min-h-[60px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`members.${index}.proof_document`}
                            render={({
                              field: { onChange, value, ...field },
                            }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="file"
                                      accept="image/*,.pdf"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        onChange(file || null);
                                      }}
                                      disabled={
                                        watchedMembers[index]?.is_present
                                      }
                                      {...field}
                                    />
                                    {!watchedMembers[index]?.is_present && (
                                      <Upload className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
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
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    member_id: "",
                    is_present: true,
                    notes: "",
                    proof_document: null,
                  })
                }
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Recording..." : "Record Attendance"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCreateAttendance;
