"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  TrendingUp,
  School,
  GraduationCap,
  Mail,
  Calendar,
  MapPin,
  Users,
} from "lucide-react";
import { useMemberProfileData } from "@/hooks/use-member-profile";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const ProfilePage: React.FC = () => {
  const { profileData, isLoadingProfile } = useMemberProfileData();

  // Helper function untuk format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Loading state skeletons
  if (isLoadingProfile) {
    return (
      <div className="flex flex-col gap-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground">
          Your profile data is not available. Please contact administrator.
        </p>
      </div>
    );
  }

  const { user, profile, student, teacher, eschools, summary } = profileData;

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* User Profile Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-xl">{user.name}</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{user.role}</Badge>
                  <Badge
                    variant={user.status === "active" ? "default" : "secondary"}
                  >
                    {user.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {student && (
                <>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Student ID</p>
                      <p className="font-medium">
                        {student.student_id || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">School</p>
                      <p className="font-medium">
                        {student.school_name || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Grade Level</p>
                      <p className="font-medium">
                        {student.grade_level || "Not provided"}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {teacher && (
                <>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">License Number</p>
                      <p className="font-medium">{teacher.license_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">School</p>
                      <p className="font-medium">
                        {teacher.school_name || "Not provided"}
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Gender:</span>
                <span className="font-medium">
                  {profile?.gender === "M"
                    ? "Male"
                    : profile?.gender === "F"
                    ? "Female"
                    : "Not specified"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {profile?.date_of_birth
                      ? format(
                          new Date(profile.date_of_birth),
                          "dd MMMM yyyy",
                          { locale: id }
                        )
                      : "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {format(new Date(user.created_at), "dd MMM yyyy", {
                      locale: id,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {profile?.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium">{profile.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Summary
            </CardTitle>
            <CardDescription>Your participation overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Total Eschools</p>
                  <p className="text-2xl font-bold text-green-900">
                    {summary?.total_eschools || 0}
                  </p>
                </div>
                <School className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Your Roles:</p>
                <div className="flex flex-wrap gap-1">
                  {summary?.roles?.length > 0 ? (
                    summary.roles.map((role: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No roles assigned
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Schools Involved:</p>
                <div className="flex flex-wrap gap-1">
                  {summary?.schools_involved?.length > 0 ? (
                    summary.schools_involved.map(
                      (school: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {school}
                        </Badge>
                      )
                    )
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No schools
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eschools Participation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Eschools Participation
          </CardTitle>
          <CardDescription>
            Extracurricular activities you&apos;re currently participating in
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eschools && eschools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eschools.map((eschool: any) => (
                <Card
                  key={eschool.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-lg">{eschool.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {eschool.school_name}
                        </p>
                      </div>
                      <Badge variant="outline">{eschool.role}</Badge>
                    </div>

                    {eschool.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {eschool.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <h2 className="text-muted-foreground">Schedule:</h2>
                        <div className="flex gap-x-1">
                          {eschool.schedule_days.map((item: string) => (
                            <Badge key={item.trim()} className="font-medium">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Monthly Fee:
                        </span>
                        <span className="font-medium">
                          {formatCurrency(eschool.monthly_fee_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Joined:</span>
                        <span className="font-medium">
                          {format(new Date(eschool.joined_at), "dd MMM yyyy", {
                            locale: id,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <Badge
                        variant={eschool.is_active ? "default" : "secondary"}
                      >
                        {eschool.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <School className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Eschools Yet</h3>
              <p className="text-muted-foreground">
                You are not participating in any extracurricular activities yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
