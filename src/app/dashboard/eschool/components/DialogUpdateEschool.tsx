"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MultiSelect from "@/components/ui/multi-select";
import { Eschool, User } from "@/types/api";
import {
  useEligibleTreasurers,
  useEligibleCoordinators,
} from "@/hooks/use-eschool";
import { useAuth } from "@/hooks/use-auth";
import {
  User as UserIcon,
  CreditCard,
  Building,
  Save,
  X,
  Settings,
  Loader2,
} from "lucide-react";

const eschoolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  coordinator_id: z.string().optional(),
  treasurer_id: z.string().optional(),
  schedule_days: z.array(z.string()).optional(),
  monthly_kas_amount: z.string().optional(),
  is_active: z.boolean().optional(),
});

type EschoolFormData = z.infer<typeof eschoolSchema>;

interface DialogUpdateEschoolProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  eschool: Eschool | null;
  onUpdate: (id: number, data: any) => void;
  isUpdating: boolean;
}

const DialogUpdateEschool: React.FC<DialogUpdateEschoolProps> = ({
  isOpen,
  onOpenChange,
  eschool,
  onUpdate,
  isUpdating,
}) => {
  const { user } = useAuth();
  const form = useForm<EschoolFormData>({
    resolver: zodResolver(eschoolSchema),
    defaultValues: {
      name: "",
      description: "",
      coordinator_id: "none",
      treasurer_id: "none",
      schedule_days: [],
      monthly_kas_amount: "",
      is_active: true,
    },
  });

  const { data: treasurers = [], isLoading: loadingTreasurers } =
    useEligibleTreasurers();
  console.log(`THIS IS  ~ treasurers:`, treasurers);
  const { data: coordinators = [], isLoading: loadingCoordinators } =
    useEligibleCoordinators();
  console.log(`THIS IS  ~ coordinators:`, coordinators);

  const onSubmit = (second) => { third }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Update Eschool
          </DialogTitle>
          <DialogDescription>
            Modify the details of this extracurricular activity.
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
                        <Input placeholder="Enter eschool name" {...field} />
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

            {/* Coordinator Selection */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserIcon className="h-4 w-4" />
                  Coordinator
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select a coordinator for this eschool from eligible teachers.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="coordinator_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Coordinator</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a coordinator" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingCoordinators ? (
                            <SelectItem value="__loading__" disabled>
                              Loading coordinators...
                            </SelectItem>
                          ) : (
                            <>
                              <SelectItem value="none">
                                No coordinator
                              </SelectItem>
                              {coordinators.map((coordinator) => (
                                <SelectItem
                                  key={coordinator.id}
                                  value={String(coordinator.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4" />
                                    <span>{coordinator.name}</span>
                                    <span className="text-muted-foreground text-xs">
                                      ({coordinator.email})
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {eschool?.coordinator && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Current Coordinator:</span>{" "}
                      {eschool.coordinator.name} ({eschool.coordinator.email})
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Treasurer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4" />
                  Treasurer
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select a treasurer for this eschool.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="treasurer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Treasurer</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a treasurer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingTreasurers ? (
                            <SelectItem value="__loading__" disabled>
                              Loading treasurers...
                            </SelectItem>
                          ) : (
                            <>
                              {/* <SelectItem value="none">No treasurer</SelectItem> */}
                              {treasurers?.map((treasurer) => (
                                <SelectItem
                                  key={treasurer.id}
                                  value={String(treasurer.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4" />
                                    <span>{treasurer.name}</span>
                                    <span className="text-muted-foreground text-xs">
                                      ({treasurer.email})
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {eschool?.treasurer && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Current Treasurer:</span>{" "}
                      {eschool.treasurer.name} ({eschool.treasurer.email})
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Additional Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4" />
                  Additional Settings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure optional settings for this eschool.
                </p>
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
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-primary hover:bg-primary/90"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Eschool
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

export default DialogUpdateEschool;
