import * as z from "zod";

// Schema for attendance form validation
export const attendanceSchema = z.object({
  date: z.string().min(1, "Date is required"),
  members: z
    .array(
      z.object({
        member_id: z.string().min(1, "Member is required"),
        is_present: z.boolean(),
        notes: z.string().optional(),
        proof_document: z
          .any()
          .optional()
          .refine(
            (file) => {
              if (!file) return true; // Optional file
              return file instanceof File;
            },
            {
              message: "Must be a valid file",
            }
          ),
      })
    )
    .min(1, "At least one member is required"),
});

export type AttendanceFormData = z.infer<typeof attendanceSchema>;

// Schema for update attendance form
export const updateAttendanceSchema = z.object({
  is_present: z.boolean(),
  notes: z.string().optional(),
  proof_document: z
    .any()
    .optional()
    .refine(
      (file) => {
        if (!file) return true; // Optional file
        return file instanceof File;
      },
      {
        message: "Must be a valid file",
      }
    ),
});

export type UpdateAttendanceFormData = z.infer<typeof updateAttendanceSchema>;
