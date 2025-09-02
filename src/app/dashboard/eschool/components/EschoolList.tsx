"use client";

import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users, User, Edit, Trash2, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Eschool } from "@/types/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EschoolListProps {
  eschools: Eschool[];
  isLoading: boolean;
  onEdit: (eschool: Eschool) => void;
  onDelete: (eschool: Eschool) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const EschoolList: React.FC<EschoolListProps> = ({
  eschools,
  isLoading,
  onEdit,
  onDelete,
  searchTerm,
  setSearchTerm,
}) => {
  const { user } = useAuth();

  const filteredEschools = useMemo(() => {
    if (!eschools) return [];
    
    return eschools.filter((eschool) => {
      return (
        eschool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eschool.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ""
      );
    });
  }, [eschools, searchTerm]);

  if (isLoading) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Eschools</CardTitle>
            <CardDescription>
              Manage your school's extracurricular activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Eschools
              </CardTitle>
              <CardDescription>
                Manage your school's extracurricular activities
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search eschools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEschools.length === 0 ? (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-medium">No eschools found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm
                  ? "No eschools match your search."
                  : "Get started by creating a new eschool."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Coordinator</TableHead>
                  <TableHead>Treasurer</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEschools.map((eschool) => (
                  <TableRow key={eschool.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{eschool.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {eschool.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {eschool.description || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {eschool.schedule_days && Array.isArray(eschool.schedule_days) && eschool.schedule_days.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {eschool.schedule_days.map((day, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {day}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {eschool.coordinator ? (
                        <div className="flex items-center gap-2">
                          <div className="bg-green-100 p-1 rounded-full">
                            <User className="h-3 w-3 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{eschool.coordinator.name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {eschool.coordinator.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline">Not assigned</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {eschool.treasurer ? (
                        <div className="flex items-center gap-2">
                          <div className="bg-purple-100 p-1 rounded-full">
                            <User className="h-3 w-3 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{eschool.treasurer.name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {eschool.treasurer.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline">Not assigned</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-yellow-100 p-1 rounded-full">
                          <Users className="h-3 w-3 text-yellow-600" />
                        </div>
                        <span className="font-medium">{eschool.members_count}</span>
                        <span className="text-xs text-muted-foreground">members</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {user?.role === "staff" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(eschool)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(eschool)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EschoolList;