import z from "zod";

// Form schema
export const incomeSchema = z.object({
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  payments: z
    .array(
      z.object({
        member_id: z.string().min(1, "Please select a member"),
        amount: z
          .string()
          .min(1, "Amount is required")
          .refine(
            (val) => !isNaN(Number(val)) && Number(val) > 0,
            "Amount must be a positive number"
          )
          .refine(
            (val) => {
              const num = Number(val);
              // Allow predefined denominations or multiples of 5000
              const predefined = ["5000", "10000", "20000", "25000", "50000", "100000"];
              return predefined.includes(val) || (num % 5000 === 0);
            },
            "Amount must be 5000, 10000, 20000, 25000, 50000, 100000, or a multiple of 5000"
          ),
        month: z
          .string()
          .min(1, "Month is required")
          .refine(
            (val) =>
              !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 12,
            "Month must be between 1 and 12"
          ),
        year: z
          .string()
          .min(1, "Year is required")
          .refine(
            (val) =>
              !isNaN(Number(val)) && Number(val) >= 2020 && Number(val) <= 2100,
            "Year must be between 2020 and 2100"
          ),
      })
    )
    .min(1, "At least one payment is required"),
});

export const expenseSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Amount must be a positive number"
    ),
  description: z.string().min(1, "Description is required"),
  category: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

export type IncomeFormData = z.infer<typeof incomeSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};