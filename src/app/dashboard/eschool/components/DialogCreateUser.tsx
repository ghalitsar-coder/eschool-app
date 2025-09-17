"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Plus, User, UserCircle, Loader2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateUser } from "@/hooks/use-user"; // Import the new hook

// Define schemas for both teacher and student
const teacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["M", "F"], { required_error: "Gender is required" }),
  license_number: z.string().min(1, "License number is required"),
  address: z.string().optional(),
});

const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["M", "F"], { required_error: "Gender is required" }),
  student_id: z.string().min(1, "Student ID is required"),
  grade_level: z.string().min(1, "Grade level is required"),
  address: z.string().optional(),
});

type TeacherFormData = z.infer<typeof teacherSchema>;
type StudentFormData = z.infer<typeof studentSchema>;

interface DialogCreateUserProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // Remove the onCreate and isCreating props as we'll use the hook
}

const DialogCreateUser: React.FC<DialogCreateUserProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [userType, setUserType] = useState<"teacher" | "student">("teacher");
  const createUserMutation = useCreateUser(); // Use the new hook

  // Initialize form based on user type
  const form = useForm<TeacherFormData | StudentFormData>({
    resolver: zodResolver(
      userType === "teacher" ? teacherSchema : studentSchema
    ),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      date_of_birth: "",
      gender: undefined,
      ...(userType === "teacher"
        ? { license_number: "", address: "" }
        : { student_id: "", grade_level: "", address: "" }),
    },
  });

  const onSubmit = (data: TeacherFormData | StudentFormData) => {
    // Convert date string to Date object for backend
    let dateOfBirthFormatted;
    if (typeof data.date_of_birth === "string" && data.date_of_birth) {
      // If it's a string in yyyy-MM-dd format, convert to Date object
      dateOfBirthFormatted = data.date_of_birth;
    } else {
      // Handle undefined or other cases
      dateOfBirthFormatted = "";
    }

    const payload = {
      ...data,
      user_type: userType,
      date_of_birth: dateOfBirthFormatted,
    };

    // Use the mutation instead of the onCreate prop
    createUserMutation.mutate(payload, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Create New User
          </DialogTitle>
          <DialogDescription>
            Create a new teacher or student user.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={userType}
          onValueChange={(value) => setUserType(value as "teacher" | "student")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teacher">Teacher</TabsTrigger>
            <TabsTrigger value="student">Student</TabsTrigger>
          </TabsList>
        </Tabs>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserCircle className="h-4 w-4" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
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
                                date.getFullYear() < 1900 ||
                                date.getFullYear() > new Date().getFullYear()
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="M">Male</SelectItem>
                            <SelectItem value="F">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Teacher or Student Specific Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserCircle className="h-4 w-4" />
                  {userType === "teacher"
                    ? "Teacher Information"
                    : "Student Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userType === "teacher" ? (
                  <>
                    <FormField
                      control={form.control}
                      name="license_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Number *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter teacher license number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter address"
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
                  <>
                    <FormField
                      control={form.control}
                      name="student_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student ID *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter student ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="grade_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade Level *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter grade level" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter address"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
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
                disabled={createUserMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create User
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

export default DialogCreateUser;
