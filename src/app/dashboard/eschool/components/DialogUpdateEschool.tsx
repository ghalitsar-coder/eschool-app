"use client";

import React from "react";
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
import { Switch } from "@/components/ui/switch";

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

  const { data: eligibleTreasurers = [], isLoading: loadingTreasurers } =
    useEligibleTreasurers();

  const { data: eligibleCoordinators = [], isLoading: loadingCoordinators } =
    useEligibleCoordinators();

  // Prepare coordinators options - prioritize current coordinator from eschool
  const coordinatorOptions = React.useMemo(() => {
    const options = [];

    // Add current coordinator from eschool if exists (always show first)
    if (eschool?.coordinator) {
      options.push({
        user_id: eschool.coordinator_id,
        name: eschool.coordinator.name,
        email: eschool.coordinator.email,
        isCurrent: true,
      });
    }

    // Add other eligible coordinators (filter out current if already added)
    eligibleCoordinators.forEach((coord) => {
      if (!eschool?.coordinator || coord.user_id !== eschool.coordinator_id) {
        options.push({
          ...coord,
          isCurrent: false,
        });
      }
    });

    return options;
  }, [eschool, eligibleCoordinators]);

  // Prepare treasurers options - prioritize current treasurer from eschool
  const treasurerOptions = React.useMemo(() => {
    const options = [];

    // Add current treasurer from eschool if exists (always show first)
    if (eschool?.treasurer) {
      options.push({
        user_id: eschool.treasurer_id,
        name: eschool.treasurer.name,
        email: eschool.treasurer.email,
        isCurrent: true,
      });
    }

    // Add other eligible treasurers (filter out current if already added)
    eligibleTreasurers.forEach((treas) => {
      if (!eschool?.treasurer || treas.user_id !== eschool.treasurer_id) {
        options.push({
          ...treas,
          isCurrent: false,
        });
      }
    });

    return options;
  }, [eschool, eligibleTreasurers]);

  console.log("=== OPTIONS DEBUG ===");
  console.log("eschool:", eschool);
  console.log("coordinatorOptions:", coordinatorOptions);
  console.log("treasurerOptions:", treasurerOptions);

  const form = useForm<EschoolFormData>({
    resolver: zodResolver(eschoolSchema),
    defaultValues: {
      name: "",
      description: "",
      coordinator_id: "__none__",
      treasurer_id: "__none__",
      schedule_days: [],
      monthly_kas_amount: "",
      is_active: true,
    },
  });

  // Reset form when eschool changes
  React.useEffect(() => {
    if (eschool && isOpen) {
      console.log("=== RESETTING FORM ===");

      const resetValues = {
        name: eschool.name || "",
        description: eschool.description || "",
        coordinator_id: eschool.coordinator_id
          ? String(eschool.coordinator_id)
          : "__none__",
        treasurer_id: eschool.treasurer_id
          ? String(eschool.treasurer_id)
          : "__none__",
        schedule_days: eschool.schedule_days || [],
        monthly_kas_amount: eschool.monthly_kas_amount?.toString() || "",
        is_active: eschool.is_active ?? true,
      };

      console.log("Reset values:", resetValues);
      form.reset(resetValues);
    }
  }, [eschool, isOpen, form]);

  // Helper function to get display name for coordinator
  const getCoordinatorDisplayName = (value: string | undefined) => {
    if (!value || value === "__none__") return null;
    const coordinator = coordinatorOptions.find(
      (c) => String(c.user_id) === value
    );
    return coordinator ? coordinator.name : null;
  };

  // Helper function to get display name for treasurer
  const getTreasurerDisplayName = (value: string | undefined) => {
    if (!value || value === "__none__") return null;
    const treasurer = treasurerOptions.find((t) => String(t.user_id) === value);
    return treasurer ? treasurer.name : null;
  };

  const onSubmit = (data: EschoolFormData) => {
    if (!eschool) return;

    console.log("Submitting form data:", data);

    const payload: any = {
      ...data,
      coordinator_id:
        data.coordinator_id === "__none__"
          ? null
          : data.coordinator_id
          ? parseInt(data.coordinator_id)
          : null,
      treasurer_id:
        data.treasurer_id === "__none__"
          ? null
          : data.treasurer_id
          ? parseInt(data.treasurer_id)
          : null,
      ...(data.monthly_kas_amount && {
        monthly_fee_amount: parseFloat(data.monthly_kas_amount),
      }),
    };

    Object.keys(payload).forEach(
      (key) => payload[key] === undefined && delete payload[key]
    );

    console.log("Final payload:", payload);
    onUpdate(eschool.id, payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Update Eschool: {eschool?.name}
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
                <div className="text-xs bg-blue-50 p-2 rounded">
                  Current: {form.watch("coordinator_id")} | Display:{" "}
                  {getCoordinatorDisplayName(form.watch("coordinator_id"))} |
                  Options: {coordinatorOptions.length}
                  {eschool?.coordinator && (
                    <div>Eschool Coordinator: {eschool.coordinator.name}</div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="coordinator_id"
                  render={({ field }) => {
                    const displayName = getCoordinatorDisplayName(field.value);

                    return (
                      <FormItem>
                        <FormLabel>Select Coordinator</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "__none__"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  displayName || "Choose a coordinator"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* <SelectItem value="__none__">
                              No coordinator assigned
                            </SelectItem> */}
                            {coordinatorOptions.map((coordinator) => (
                              <SelectItem
                                key={coordinator.user_id}
                                value={String(coordinator.user_id)}
                              >
                                <div className="flex items-center gap-2">
                                  <UserIcon className="h-4 w-4" />
                                  <span>{coordinator.name}</span>
                                  {coordinator.isCurrent && (
                                    <span className="text-green-600 text-xs font-medium">
                                      (Current)
                                    </span>
                                  )}
                                  <span className="text-muted-foreground text-xs">
                                    ({coordinator.email})
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                            {loadingCoordinators && (
                              <SelectItem value="__loading__" disabled>
                                Loading more coordinators...
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
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
                <div className="text-xs bg-green-50 p-2 rounded">
                  Current: {form.watch("treasurer_id")} | Display:{" "}
                  {getTreasurerDisplayName(form.watch("treasurer_id"))} |
                  Options: {treasurerOptions.length}
                  {eschool?.treasurer && (
                    <div>Eschool Treasurer: {eschool.treasurer.name}</div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="treasurer_id"
                  render={({ field }) => {
                    const displayName = getTreasurerDisplayName(field.value);

                    return (
                      <FormItem>
                        <FormLabel>Select Treasurer</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "__none__"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  displayName || "Choose a treasurer"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* <SelectItem value="__none__">
                              No treasurer assigned
                            </SelectItem> */}
                            {treasurerOptions.map((treasurer) => (
                              <SelectItem
                                key={treasurer.user_id}
                                value={String(treasurer.user_id)}
                              >
                                <div className="flex items-center gap-2">
                                  <UserIcon className="h-4 w-4" />
                                  <span>{treasurer.name}</span>
                                  {treasurer.isCurrent && (
                                    <span className="text-green-600 text-xs font-medium">
                                      (Current)
                                    </span>
                                  )}
                                  <span className="text-muted-foreground text-xs">
                                    ({treasurer.email})
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                            {loadingTreasurers && (
                              <SelectItem value="__loading__" disabled>
                                Loading more treasurers...
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
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
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Active Status
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Enable or disable this eschool
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
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
