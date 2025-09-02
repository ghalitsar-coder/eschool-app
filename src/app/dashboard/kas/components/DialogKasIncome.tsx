"use client";

import { useKasManagement } from "@/hooks/use-kas";
import apiClient from "@/lib/api/client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  useForm,
  useFieldArray,
  FormProvider,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar as CalendarIcon,
  AlertCircle,
  Users,
  Filter,
  Download,
  Search,
  Trash2,
  ChevronDownIcon,
  Eye,
} from "lucide-react";
import FinancialCharts from "./components/FinancialCharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";
import {  IncomeFormData, incomeSchema } from "@/types/page/kas";

const DialogKasIncome = (props) => {
  const {  } = props;
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);

  const { addIncome,  members , isAddingIncome ,isLoadingMembers        } =
    useKasManagement();
  console.log(`THIS IS  ~ members:`, members)
  const incomeForm = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      description: "",
      date: new Date().toISOString().split("T")[0],
      payments: [{ member_id: "", amount: "", month: "", year: "" }],
    },
  });

   const { fields, append, remove } = useFieldArray({
    control: incomeForm.control,
    name: "payments",
  });

   const payments = useWatch({
      control: incomeForm.control,
      name: "payments",
    });

  const handleAddIncome = (data: IncomeFormData) => {
    addIncome(data, {
      onSuccess: () => {
        setShowIncomeDialog(false);
        incomeForm.reset();
        toast.success("Income added successfully");
      },
      onError: (error: any) => {
        // Handle backend validation errors
        if (error?.response?.data?.errors) {
          const backendErrors = error.response.data.errors;

          // Display errors for each payment field
          Object.keys(backendErrors).forEach((fieldPath) => {
            const errorMessage = backendErrors[fieldPath];
            incomeForm.setError(fieldPath as any, {
              message: errorMessage,
            });
          });

          // Also show a general toast error
          toast.error(
            "Failed to add income. Please check the form for errors."
          );
        } else {
          toast.error(
            `Failed to add income: ${
              error?.response?.data?.message || error.message || "Unknown error"
            }`
          );
        }
      },
    });
  };
  return (
    <Dialog open={showIncomeDialog} onOpenChange={setShowIncomeDialog}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Income
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Add Income
          </DialogTitle>
          <DialogDescription>
            Record a new income transaction for multiple members.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...incomeForm}>
          <form
            onSubmit={incomeForm.handleSubmit(handleAddIncome)}
            className="space-y-4"
          >
            <FormField
              control={incomeForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Monthly dues, donation, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={incomeForm.control}
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
              <h3 className="text-lg font-semibold mb-2">Payments</h3>
              {incomeForm.formState.errors.payments && (
                <p className="text-red-500 text-sm mb-2">
                  {incomeForm.formState.errors.payments.message}
                </p>
              )}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Amount (Rp)</TableHead>
                      <TableHead>Month & Year</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <FormField
                            control={incomeForm.control}
                            name={`payments.${index}.member_id`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Select
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      // Clear the error when member selection changes
                                      incomeForm.clearErrors(
                                        `payments.${index}.member_id`
                                      );
                                    }}
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
                                      {members.map((member) => {
                                        // Check if this member is already selected in other fields
                                        const isAlreadySelected = payments.some(
                                          (
                                            payment: any,
                                            paymentIndex: number
                                          ) =>
                                            paymentIndex !== index &&
                                            payment.member_id ===
                                              String(member.id)
                                        );

                                        return (
                                          <SelectItem
                                            key={member.id}
                                            value={String(member.id)}
                                            disabled={isAlreadySelected}
                                            className={
                                              isAlreadySelected
                                                ? "opacity-50"
                                                : ""
                                            }
                                          >
                                            {member.name}{" "}
                                            {isAlreadySelected
                                              ? "(Already selected)"
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
                            control={incomeForm.control}
                            name={`payments.${index}.amount`}
                            render={({ field }) => {
                              // Define the allowed predefined denominations
                              const predefinedDenominations = [
                                "5000",
                                "10000",
                                "20000",
                                "25000",
                                "50000",
                                "100000",
                              ];

                              // Check if the current value is a predefined denomination or custom
                              const isCustomAmount =
                                field.value &&
                                !predefinedDenominations.includes(field.value);

                              return (
                                <FormItem>
                                  {field.value === "custom" ||
                                  isCustomAmount ? (
                                    // Show input field for custom amounts
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="Enter amount (multiple of 5000)"
                                        value={
                                          field.value === "custom"
                                            ? ""
                                            : field.value
                                        }
                                        onChange={(e) => {
                                          field.onChange(e.target.value);
                                        }}
                                        min="0"
                                        step="5000"
                                      />
                                    </FormControl>
                                  ) : (
                                    // Show select for predefined amounts
                                    <FormControl>
                                      <Select
                                        onValueChange={(value) => {
                                          field.onChange(value);
                                        }}
                                        value={field.value || ""}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select amount" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {/* Predefined denominations: 5k, 10k, 20k, 25k, 50k, 100k */}
                                          <SelectItem value="5000">
                                            Rp 5.000
                                          </SelectItem>
                                          <SelectItem value="10000">
                                            Rp 10.000
                                          </SelectItem>
                                          <SelectItem value="20000">
                                            Rp 20.000
                                          </SelectItem>
                                          <SelectItem value="25000">
                                            Rp 25.000
                                          </SelectItem>
                                          <SelectItem value="50000">
                                            Rp 50.000
                                          </SelectItem>
                                          <SelectItem value="100000">
                                            Rp 100.000
                                          </SelectItem>
                                          <SelectItem value="custom">
                                            Custom Amount
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={incomeForm.control}
                            name={`payments.${index}.month`}
                            render={({ field: monthField }) => (
                              <FormField
                                control={incomeForm.control}
                                name={`payments.${index}.year`}
                                render={({ field: yearField }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                          >
                                            {monthField.value && yearField.value
                                              ? `${format(
                                                  monthField.value,
                                                  "MMM"
                                                )}, ${format(
                                                  yearField.value,
                                                  "yyyy"
                                                )}`
                                              : "Select month & year"}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                          <Calendar
                                            mode="single"
                                            onSelect={(date) => {
                                              if (date) {
                                                monthField.onChange(
                                                  (
                                                    date.getMonth() + 1
                                                  ).toString()
                                                );
                                                yearField.onChange(
                                                  date.getFullYear().toString()
                                                );
                                                // Clear the member_id error when date changes
                                                incomeForm.clearErrors(
                                                  `payments.${index}.member_id`
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
                    amount: "",
                    month: "",
                    year: "",
                  })
                }
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowIncomeDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isAddingIncome ||
                  Object.keys(incomeForm.formState.errors).length > 0
                }
                className="bg-green-600 hover:bg-green-700"
              >
                {isAddingIncome ? "Adding..." : "Add Income"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default DialogKasIncome;
