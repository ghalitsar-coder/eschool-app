"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Building,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MultiSelect from "@/components/ui/multi-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const eschoolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  schedule_days: z.array(z.string()).optional(),
  monthly_kas_amount: z.string().optional(),
  is_active: z.boolean().optional(),
});

type EschoolFormData = z.infer<typeof eschoolSchema>;

interface DialogCreateEschoolProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: any) => void;
  isCreating: boolean;
}

const DialogCreateEschool: React.FC<DialogCreateEschoolProps> = ({
  isOpen,
  onOpenChange,
  onCreate,
  isCreating,
}) => {
  const form = useForm<EschoolFormData>({
    resolver: zodResolver(eschoolSchema),
    defaultValues: {
      name: "",
      description: "",
      schedule_days: [],
      monthly_kas_amount: "",
      is_active: true,
    },
  });

  const onSubmit = (data: EschoolFormData) => {
    const payload: any = {
      ...data,
    };

    // Convert string values to appropriate types
    if (data.monthly_kas_amount) {
      payload.monthly_fee_amount = parseFloat(data.monthly_kas_amount);
    } else {
      delete payload.monthly_kas_amount;
    }

    // Handle schedule_days
    if (
      data.schedule_days &&
      Array.isArray(data.schedule_days) &&
      data.schedule_days.length > 0
    ) {
      payload.schedule_days = data.schedule_days;
    } else {
      delete payload.schedule_days;
    }

    onCreate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Create New Eschool
          </DialogTitle>
          <DialogDescription>
            Set up a new extracurricular activity.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Eschool Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building className="h-4 w-4" />
                  Eschool Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eschool Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter eschool name (e.g., Basketball Club)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the purpose and activities of this eschool"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Separator />

            {/* Additional Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building className="h-4 w-4" />
                  Additional Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="monthly_kas_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Kas Amount (IDR)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="20000"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? "" : e.target.value
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="schedule_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule Days</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={[
                            { label: "Senin", value: "Senin" },
                            { label: "Selasa", value: "Selasa" },
                            { label: "Rabu", value: "Rabu" },
                            { label: "Kamis", value: "Kamis" },
                            { label: "Jumat", value: "Jumat" },
                            { label: "Sabtu", value: "Sabtu" },
                            { label: "Minggu", value: "Minggu" },
                          ]}
                          onValueChange={field.onChange}
                          defaultValue={field.value || []}
                          placeholder="Select schedule days"
                          maxCount={7}
                          animation={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-primary hover:bg-primary/90"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Eschool
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCreateEschool;