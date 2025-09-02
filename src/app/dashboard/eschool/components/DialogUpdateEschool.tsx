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
import { Badge } from "@/components/ui/badge";
import MultiSelect from "@/components/ui/multi-select";
import { Eschool, User } from "@/types/api";
import { useEligibleTreasurers } from "@/hooks/use-eschool";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { User as UserIcon, CreditCard, Building, Mail, UserCircle, Save, X, Settings, Loader2 } from "lucide-react";

const eschoolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  // Coordinator cannot be changed - only display current coordinator info
  // Treasurer option
  treasurer_option: z.enum(["existing", "new", "no_change"]).default("no_change"),
  treasurer_id: z.string().optional(),
  new_treasurer_name: z.string().optional(),
  new_treasurer_email: z.string().email().optional(),
  new_treasurer_nip: z.string().optional(),
  new_treasurer_date_of_birth: z.string().optional(),
  new_treasurer_gender: z.enum(["L", "P"]).optional(),
  new_treasurer_address: z.string().optional(),
  new_treasurer_phone: z.string().optional(),
  schedule_days: z.array(z.string()).optional(),
  monthly_kas_amount: z.string().optional(),
  total_schedule_days: z.string().optional(),
  is_active: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.treasurer_option === "existing") {
      return !!data.treasurer_id;
    } else if (data.treasurer_option === "new") {
      return !!data.new_treasurer_name && !!data.new_treasurer_email;
    }
    return true; // no_change option doesn't require additional fields
  },
  {
    message: "Please select treasurer or provide new treasurer details",
    path: ["treasurer_id"],
  }
);

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
      treasurer_option: "no_change",
      treasurer_id: "",
      new_treasurer_name: "",
      new_treasurer_email: "",
      new_treasurer_nip: "",
      new_treasurer_date_of_birth: "",
      new_treasurer_gender: undefined,
      new_treasurer_address: "",
      new_treasurer_phone: "",
      schedule_days: [],
      monthly_kas_amount: "",
      total_schedule_days: "",
      is_active: true,
    },
  });

  const { data: treasurers = [], isLoading: loadingTreasurers } = useEligibleTreasurers();

  useEffect(() => {
    if (eschool) {
      form.reset({
        name: eschool.name,
        description: eschool.description || "",
        treasurer_option: "no_change",
        treasurer_id: eschool.treasurer_id?.toString() || "",
        new_treasurer_name: "",
        new_treasurer_email: "",
        schedule_days: Array.isArray(eschool.schedule_days) ? eschool.schedule_days : [],
        monthly_kas_amount: eschool.monthly_kas_amount?.toString() || "",
        total_schedule_days: eschool.total_schedule_days?.toString() || "",
        is_active: eschool.is_active !== undefined ? eschool.is_active : true,
      });
    }
  }, [eschool, form]);

  const onSubmit = (data: EschoolFormData) => {
    if (!eschool) return;
    
    const payload: any = { ...data };

    // Convert string values to appropriate types
    if (data.monthly_kas_amount) {
      payload.monthly_kas_amount = parseInt(data.monthly_kas_amount);
    } else {
      delete payload.monthly_kas_amount;
    }

    if (data.total_schedule_days) {
      payload.total_schedule_days = parseInt(data.total_schedule_days);
    } else {
      delete payload.total_schedule_days;
    }

    // Handle schedule_days
    if (data.schedule_days && Array.isArray(data.schedule_days) && data.schedule_days.length > 0) {
      payload.schedule_days = data.schedule_days;
    } else {
      delete payload.schedule_days;
    }

    // Only send treasurer data if user wants to change it
    if (data.treasurer_option === "no_change") {
      delete payload.treasurer_option;
      delete payload.treasurer_id;
      delete payload.new_treasurer_name;
      delete payload.new_treasurer_email;
      delete payload.new_treasurer_nip;
      delete payload.new_treasurer_date_of_birth;
      delete payload.new_treasurer_gender;
      delete payload.new_treasurer_address;
      delete payload.new_treasurer_phone;
    } else if (data.treasurer_option === "new") {
      // Handle treasurer additional fields
      if (data.new_treasurer_nip) {
        payload.new_treasurer_nip = data.new_treasurer_nip;
      }
      
      if (data.new_treasurer_date_of_birth) {
        payload.new_treasurer_date_of_birth = data.new_treasurer_date_of_birth;
      }
      
      if (data.new_treasurer_gender) {
        payload.new_treasurer_gender = data.new_treasurer_gender;
      }
      
      if (data.new_treasurer_address) {
        payload.new_treasurer_address = data.new_treasurer_address;
      }
      
      if (data.new_treasurer_phone) {
        payload.new_treasurer_phone = data.new_treasurer_phone;
      }
    }

    onUpdate(eschool.id, payload);
  };

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

            {/* Coordinator Info - Read Only */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserIcon className="h-4 w-4" />
                  Current Coordinator
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Coordinators cannot be changed once assigned to an eschool.
                </p>
              </CardHeader>
              <CardContent>
                {eschool?.coordinator ? (
                  <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <UserIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{eschool.coordinator.name}</h3>
                      <p className="text-sm text-muted-foreground">{eschool.coordinator.email}</p>
                      <Badge variant="secondary" className="mt-1">
                        Coordinator
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-muted-foreground">No coordinator assigned</p>
                  </div>
                )}
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Note:</span> To change coordinators, 
                    create a new eschool and archive this one.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Treasurer Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4" />
                  Treasurer
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update or change the treasurer for this eschool.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="treasurer_option"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treasurer Option</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select treasurer option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no_change">Keep Current Treasurer</SelectItem>
                          <SelectItem value="existing">Select Existing Treasurer</SelectItem>
                          <SelectItem value="new">Create New Treasurer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch("treasurer_option") === "existing" ? (
                  <FormField
                    control={form.control}
                    name="treasurer_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Treasurer</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                                <SelectItem value="__none__">No treasurer</SelectItem>
                                {treasurers.map((treasurer) => (
                                  <SelectItem key={treasurer.id} value={String(treasurer.id)}>
                                    <div className="flex items-center gap-2">
                                      <UserIcon className="h-4 w-4" />
                                      <span>{treasurer.name}</span>
                                      <span className="text-muted-foreground text-xs">({treasurer.email})</span>
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
                ) : form.watch("treasurer_option") === "new" ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="new_treasurer_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Treasurer Name *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  placeholder="Full name" 
                                  className="pl-10" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="new_treasurer_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="email" 
                                  placeholder="email@example.com" 
                                  className="pl-10" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="new_treasurer_nip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NIP/NIS</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="NIP/NIS" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="new_treasurer_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Phone number" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="new_treasurer_date_of_birth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="new_treasurer_gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="L">Male</SelectItem>
                                <SelectItem value="P">Female</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="new_treasurer_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter full address"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <div className="p-4 bg-secondary rounded-lg">
                    {eschool?.treasurer ? (
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <UserIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{eschool.treasurer.name}</p>
                          <p className="text-sm text-muted-foreground">{eschool.treasurer.email}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center">No treasurer currently assigned</p>
                    )}
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
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="total_schedule_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Schedule Days</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="3" 
                            {...field} 
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.value)}
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
              <Button type="submit" disabled={isUpdating} className="bg-primary hover:bg-primary/90">
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