"use client";

import { useKasManagement } from "@/hooks/use-kas";
import apiClient from "@/lib/api/client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, TrendingDown, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ExpenseFormData, expenseSchema } from "@/types/page/kas";

const DialogKasExpense = () => {
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);

  const { isAddingExpense, addExpense } = useKasManagement();
  const expenseForm = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: "",
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
    },
  });
  const handleAddExpense = (data: ExpenseFormData) => {
    addExpense(
      {
        amount: parseFloat(data.amount),
        description: data.description,
        category: data.category,
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
  return (
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
                    <Input placeholder="Equipment, supplies, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={expenseForm.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="supplies">Supplies</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                        <SelectItem value="miscellaneous">
                          Miscellaneous
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
  );
};

export default DialogKasExpense;
