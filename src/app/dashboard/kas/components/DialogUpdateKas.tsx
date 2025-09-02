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
  Calendar as CalendarIcon,
} from "lucide-react";
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
import { ExpenseFormData } from "@/types/page/kas";
import { toast } from "sonner";

const DialogUpdateKas = (props) => {
  const { showUpdateDialog, setShowUpdateDialog, selectedRecord, updateForm } =
    props;
  const { updateRecord, isUpdatingRecord } = useKasManagement();
  const handleUpdate = (data: ExpenseFormData) => {
    if (!selectedRecord) return;

    updateRecord(
      {
        id: selectedRecord.id,
        data: {
          amount: parseFloat(data.amount),
          description: data.description,
          category: data.category,
          date: data.date,
        },
      },
      {
        onSuccess: () => {
          setShowUpdateDialog(false);
          updateForm.reset();
          toast.success("Record updated successfully");
        },
        onError: (error: any) => {
          toast.error(
            `Failed to update record: ${error?.message || "Unknown error"}`
          );
        },
      }
    );
  };
  return (
    <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Update Expense
          </DialogTitle>
          <DialogDescription>
            Update this expense transaction.
          </DialogDescription>
        </DialogHeader>
        <Form {...updateForm}>
          <form
            onSubmit={updateForm.handleSubmit(handleUpdate)}
            className="space-y-4"
          >
            <FormField
              control={updateForm.control}
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
              control={updateForm.control}
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
              control={updateForm.control}
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
              control={updateForm.control}
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
                onClick={() => setShowUpdateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingRecord}
                className="bg-red-600 hover:bg-red-700"
              >
                {isUpdatingRecord ? "Updating..." : "Update Expense"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogUpdateKas;
