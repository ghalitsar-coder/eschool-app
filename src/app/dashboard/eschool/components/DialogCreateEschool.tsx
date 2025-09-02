"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, User, Users, CreditCard, Building, Mail, UserCircle, Info, Settings, Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import { Eschool, User as UserType } from "@/types/api";
import { useEligibleTreasurers } from "@/hooks/use-eschool";
import { useAuth } from "@/hooks/use-auth";

const eschoolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  // New coordinator fields (always required for new eschool)
  new_coordinator_name: z.string().min(1, "Coordinator name is required"),
  new_coordinator_email: z.string().email("Invalid email format"),
  new_coordinator_nip: z.string().optional(),
  new_coordinator_date_of_birth: z.string().optional(),
  new_coordinator_gender: z.enum(["L", "P"]).optional(),
  new_coordinator_address: z.string().optional(),
  new_coordinator_phone: z.string().optional(),
  // Treasurer option
  treasurer_option: z.enum(["existing", "new"]).default("existing"),
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
    return true;
  },
  {
    message: "Please select treasurer or provide new treasurer details",
    path: ["treasurer_id"],
  }
);

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
  const { user } = useAuth();
  const form = useForm<EschoolFormData>({
    resolver: zodResolver(eschoolSchema),
    defaultValues: {
      name: "",
      description: "",
      new_coordinator_name: "",
      new_coordinator_email: "",
      new_coordinator_nip: "",
      new_coordinator_date_of_birth: "",
      new_coordinator_gender: undefined,
      new_coordinator_address: "",
      new_coordinator_phone: "",
      treasurer_option: "existing",
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
  console.log(`THIS IS  ~ treasurers:`, treasurers)

  const onSubmit = (data: EschoolFormData) => {
    const payload: any = {
      ...data,
      school_id: user?.school_id || 1,
      // Always create new coordinator for new eschool
      coordinator_option: "new",
      // Treasurer option based on user selection
      treasurer_option: data.treasurer_option,
    };

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

    // Handle coordinator additional fields
    if (data.new_coordinator_nip) {
      payload.new_coordinator_nip = data.new_coordinator_nip;
    }
    
    if (data.new_coordinator_date_of_birth) {
      payload.new_coordinator_date_of_birth = data.new_coordinator_date_of_birth;
    }
    
    if (data.new_coordinator_gender) {
      payload.new_coordinator_gender = data.new_coordinator_gender;
    }
    
    if (data.new_coordinator_address) {
      payload.new_coordinator_address = data.new_coordinator_address;
    }
    
    if (data.new_coordinator_phone) {
      payload.new_coordinator_phone = data.new_coordinator_phone;
    }

    // Handle treasurer additional fields
    if (data.treasurer_option === "new") {
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
      
      // Remove treasurer_id when creating new treasurer
      delete payload.treasurer_id;
    } else {
      // Remove new treasurer fields when selecting existing treasurer
      delete payload.new_treasurer_name;
      delete payload.new_treasurer_email;
      delete payload.new_treasurer_nip;
      delete payload.new_treasurer_date_of_birth;
      delete payload.new_treasurer_gender;
      delete payload.new_treasurer_address;
      delete payload.new_treasurer_phone;
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
            Set up a new extracurricular activity with its coordinator and treasurer.
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

            {/* Coordinator Section */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Coordinator (New Account)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  A new coordinator account will be created for this eschool.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="new_coordinator_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coordinator Name *</FormLabel>
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
                    name="new_coordinator_email"
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
                    name="new_coordinator_nip"
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
                    name="new_coordinator_phone"
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
                    name="new_coordinator_date_of_birth"
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
                    name="new_coordinator_gender"
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
                  name="new_coordinator_address"
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
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Account Setup</p>
                      <p className="text-xs text-blue-700">
                        The coordinator will receive login credentials via email. 
                        They will be able to manage this eschool exclusively.
                        <br />
                        <strong className="text-blue-900">Default password:</strong> password
                      </p>
                    </div>
                  </div>
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
                  Select an existing treasurer or create a new one for this eschool.
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
                          <SelectItem value="existing">Select Existing Treasurer</SelectItem>
                          <SelectItem value="new">Create New Treasurer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("treasurer_option") === "existing" ? (
                  <>
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
                              ) : treasurers.length > 0 ? (
                                treasurers.map((treasurer) => (
                                  <SelectItem key={treasurer.id} value={String(treasurer.id)}>
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4" />
                                      <span>{treasurer.name}</span>
                                      <span className="text-muted-foreground text-xs">({treasurer.email})</span>
                                    </div>
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="__none__" disabled>
                                  No available treasurers
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
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
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Account Setup</p>
                          <p className="text-xs text-blue-700">
                            The treasurer will receive login credentials via email. 
                            They will be able to manage the finances for this eschool exclusively.
                            <br />
                            <strong className="text-blue-900">Default password:</strong> password
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
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
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating} className="bg-primary hover:bg-primary/90">
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