"use client";

import { useKasManagement } from "@/hooks/use-kas";
import React, { useState } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
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
} from "lucide-react";
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
import { format } from 'date-fns';

// Form schema
const incomeSchema = z.object({
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

const expenseSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Amount must be a positive number"
    ),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
});

type IncomeFormData = z.infer<typeof incomeSchema>;
type ExpenseFormData = z.infer<typeof expenseSchema>;

const KasManagement: React.FC = () => {
  const {
    records,
    summary,
    members,
    isLoadingRecords,
    isLoadingSummary,
    isLoadingMembers,
    isAddingIncome,
    isAddingExpense,
    isExporting,
    recordsError,
    summaryError,
    membersError,
    addIncomeError,
    addExpenseError,
    exportError,
    addIncome,
    addExpense,
    exportRecords,
  } = useKasManagement();

  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Forms
  const incomeForm = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      description: "",
      date: new Date().toISOString().split("T")[0],
      payments: [{ member_id: "", amount: "", month: "", year: "" }],
    },
  });
  // console.log(`THIS IS  ~ incomeForm:`, incomeForm);

  const { fields, append, remove } = useFieldArray({
    control: incomeForm.control,
    name: "payments",
  });
  // console.log(`THIS IS  ~ fields:`, fields);

  const expenseForm = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const handleAddIncome = (data: IncomeFormData) => {
    addIncome(data, {
      onSuccess: () => {
        setShowIncomeDialog(false);
        incomeForm.reset();
      },
    });
  };

  const handleAddExpense = (data: ExpenseFormData) => {
    addExpense(
      {
        amount: parseFloat(data.amount),
        description: data.description,
        date: data.date,
      },
      {
        onSuccess: () => {
          setShowExpenseDialog(false);
          expenseForm.reset();
        },
      }
    );
  };

  const filteredRecords = records.filter(
    (record) =>
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoadingSummary || isLoadingRecords || isLoadingMembers) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const hasErrors =
    summaryError ||
    recordsError ||
    membersError ||
    addIncomeError ||
    addExpenseError ||
    exportError;

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Cash Management
            </h1>
            <p className="text-muted-foreground">
              Track income, expenses, and manage your organization&apos;s
              finances
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportRecords({ format: "csv" })}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
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
              {summaryError && <div>Summary: {summaryError.message}</div>}
              {recordsError && <div>Records: {recordsError.message}</div>}
              {membersError && <div>Members: {membersError.message}</div>}
              {addIncomeError && (
                <div>Add Income: {addIncomeError.message}</div>
              )}
              {addExpenseError && (
                <div>Add Expense: {addExpenseError.message}</div>
              )}
              {exportError && <div>Export: {exportError.message}</div>}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {summary.summary.total_income.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time income</p>
          </CardContent>
        </Card>
        <Card className="@container/card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              Rp {summary.summary.total_expense.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time expenses</p>
          </CardContent>
        </Card>
        <Card className="@container/card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                summary.summary.balance >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              Rp {summary.summary.balance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Available funds</p>
          </CardContent>
        </Card>
        <Card className="@container/card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Members
            </CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.summary.total_members}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.current_month.payment_percentage.toFixed(1)}% paid this
              month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-4">
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
                            ? format(new Date(field.value), 'MMM dd, yyyy')
                            : 'Select date'}
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
                              field.onChange(format(date, 'yyyy-MM-dd'));
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
                                            {members.map((member) => {
                                              return (
                                                <SelectItem
                                                  key={member.id}
                                                  value={String(member.id)}
                                                >
                                                  {member.name}
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
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="0"
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
                                                  {monthField.value &&
                                                  yearField.value
                                                    ? `${format(monthField.value,'MMM')}, ${format(yearField.value,'yyyy')}`
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
                                                        date
                                                          .getFullYear()
                                                          .toString()
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
                      disabled={isAddingIncome}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isAddingIncome ? "Adding..." : "Add Income"}
                    </Button>
                  </DialogFooter>
                </form>
              </FormProvider>
            </DialogContent>
          </Dialog>

          <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Add Expense
                </DialogTitle>
                <DialogDescription>
                  Record a new expense transaction.
                </DialogDescription>
              </DialogHeader>
              <Form {...expenseForm}>
                <form
                  onSubmit={expenseForm.handleSubmit(handleAddExpense)}
                  className="space-y-4"
                >
                  <FormField
                    control={expenseForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (Rp)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={expenseForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Equipment, supplies, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={expenseForm.control}
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
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowExpenseDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isAddingExpense}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isAddingExpense ? "Adding..." : "Add Expense"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  A list of all income and expense transactions
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
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
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchTerm
                          ? "No transactions found matching your search."
                          : "No transactions recorded yet."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            {new Date(record.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.type === "income" ? "default" : "secondary"
                            }
                            className={
                              record.type === "income"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-red-100 text-red-800 hover:bg-red-100"
                            }
                          >
                            {record.type === "income" ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {record.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.description}</TableCell>
                        <TableCell className="text-right font-medium">
                          <span
                            className={
                              record.type === "income"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {record.type === "income" ? "+" : "-"}Rp{" "}
                            {record.amount.toLocaleString()}
                          </span>
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
    </div>
  );
};

export default KasManagement;
