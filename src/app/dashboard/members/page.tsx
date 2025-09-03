"use client";

import { useState, useEffect } from "react";
import { useMemberManagement } from "@/hooks/use-member-management";
import { useAuthStore } from "@/lib/stores/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Filter,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MemberManagementPage = () => {
  const { user } = useAuthStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("all");

  // Form state for assigning role
  const [assignRoleForm, setAssignRoleForm] = useState({
    user_id: "",
    role: "member",
    student_id: "",
  });

  const {
    members,
    users: availableUsers,
    roleSummary,
    pagination,
    isLoadingMembers,
    isLoadingUsers,
    isAssigning,
    isUpdating,
    isRemoving,
    membersError,
    usersError,
    assignError,
    updateError,
    removeError,
    fetchMembers,
    fetchAvailableUsers,
    assignRole,
    updateRole,
    removeRole,
  } = useMemberManagement({
    page: currentPage,
    perPage: 15,
    search: searchTerm,
    roleFilter: roleFilter,
    eschoolId: user?.eschool_id, // Assuming user has eschool_id from auth
    userRole: user?.role,
  });

  const handleViewMember = (member: any) => {
    setSelectedMember(member);
    setIsViewDialogOpen(true);
  };

  const handleEditMember = (member: any) => {
    setSelectedMember(member);
    setIsEditDialogOpen(true);
  };

  const handleDeleteMemberPrompt = (member: any) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteMember = async () => {
    try {
      if (!selectedMember || !user?.eschool_id) return;
      await removeRole({
        eschoolId: user.eschool_id,
        userId: selectedMember.user_id,
      });
      setIsDeleteDialogOpen(false);
      toast.success("Role removed successfully");
    } catch (error: any) {
      console.error("Error removing role:", error);
      toast.error("Failed to remove role", {
        description: error?.message || "An unexpected error occurred",
      });
    }
  };

  const handleAssignRole = async () => {
    try {
      if (!user?.eschool_id) return;

      const data = {
        eschoolId: user.eschool_id,
        user_id: parseInt(assignRoleForm.user_id),
        role: assignRoleForm.role,
        ...(assignRoleForm.role !== "koordinator" && assignRoleForm.student_id
          ? {
              member_details: {
                student_id: assignRoleForm.student_id,
              },
            }
          : {}),
      };

      await assignRole(data);
      setIsCreateDialogOpen(false);
      toast.success("Role assigned successfully");

      // Reset form
      setAssignRoleForm({
        user_id: "",
        role: "member",
        student_id: "",
      });
    } catch (error: any) {
      console.error("Error assigning role:", error);
      toast.error("Failed to assign role", {
        description: error?.message || "An unexpected error occurred",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Member Management
              </h1>
              <p className="text-muted-foreground">Manage eschool members</p>
            </div>
          </div>
        </div>
        <div className="px-4 lg:px-6">
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Member Management
            </h1>
            <p className="text-muted-foreground">Manage eschool members</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            {(user.role === "koordinator" || user.role === "staff") && (
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAssignRole();
                    }}
                  >
                    <DialogHeader>
                      <DialogTitle>Assign Role</DialogTitle>
                      <DialogDescription>
                        Assign a role to a user in this eschool
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div>
                        <Label className="text-sm font-medium">User</Label>
                        <Select
                        
                          value={assignRoleForm.user_id}
                          onValueChange={(value) =>
                            setAssignRoleForm({
                              ...assignRoleForm,
                              user_id: value,
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableUsers?.map((user) => (
                              <SelectItem
                                key={user.id}
                                value={user.id.toString()}
                              >
                                {user.name} ({user.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Role</Label>
                        <Select
                          value={assignRoleForm.role}
                          onValueChange={(value) =>
                            setAssignRoleForm({
                              ...assignRoleForm,
                              role: value,
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="bendahara" disabled>
                              Bendahara (bendahara sudah terisi){" "}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(assignRoleForm.role === "member" ||
                        assignRoleForm.role === "bendahara") && (
                        <div>
                          <Label className="text-sm font-medium">
                            Student ID
                          </Label>
                          <Input
                            value={assignRoleForm.student_id}
                            onChange={(e) =>
                              setAssignRoleForm({
                                ...assignRoleForm,
                                student_id: e.target.value,
                              })
                            }
                            placeholder="Enter student ID"
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        type="button"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isAssigning}>
                        {isAssigning ? "Assigning..." : "Assign Role"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Error Alerts */}
      {(membersError ||
        usersError ||
        assignError ||
        updateError ||
        removeError) && (
        <div className="px-4 lg:px-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {membersError && <div>Members: {membersError.message}</div>}
              {usersError && <div>Users: {usersError.message}</div>}
              {assignError && <div>Assign: {assignError.message}</div>}
              {updateError && <div>Update: {updateError.message}</div>}
              {removeError && <div>Delete: {removeError.message}</div>}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Search and Filters */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Members</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="bendahara">Bendahara</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingMembers ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Attendance Rate</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members && members.length > 0 ? (
                      members.map((member) => (
                        <TableRow key={member.user_id}>
                          <TableCell>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.email}
                            </div>
                          </TableCell>
                          <TableCell>{member.student_id || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                member.role_in_eschool === "koordinator"
                                  ? "default"
                                  : member.role_in_eschool === "bendahara"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {member.role_in_eschool}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>
                                {member.attendance_summary.attendance_rate}%
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({member.attendance_summary.attended}/
                                {member.attendance_summary.total_sessions})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewMember(member)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {(user.role === "koordinator" ||
                                user.role === "staff") && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditMember(member)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteMemberPrompt(member)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-muted-foreground"
                        >
                          {searchTerm || roleFilter !== "all"
                            ? "No members found matching your search."
                            : "No members found."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing{" "}
                      {(pagination.current_page - 1) * pagination.per_page + 1}{" "}
                      to{" "}
                      {Math.min(
                        pagination.current_page * pagination.per_page,
                        pagination.total
                      )}{" "}
                      of {pagination.total} members
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(
                            Math.max(1, pagination.current_page - 1)
                          )
                        }
                        disabled={pagination.current_page === 1}
                      >
                        Previous
                      </Button>
                      <div className="text-sm">
                        Page {pagination.current_page} of {pagination.last_page}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(
                            Math.min(
                              pagination.last_page,
                              pagination.current_page + 1
                            )
                          )
                        }
                        disabled={
                          pagination.current_page === pagination.last_page
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>
              Detailed information about this member
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-gray-600">{selectedMember.name}</p>
                </div>
                <div>
                  <Label>Student ID</Label>
                  <p className="text-gray-600">
                    {selectedMember.student_id || "-"}
                  </p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-gray-600">{selectedMember.email || "-"}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <Badge
                    variant={
                      selectedMember.role_in_eschool === "koordinator"
                        ? "default"
                        : selectedMember.role_in_eschool === "bendahara"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {selectedMember.role_in_eschool}
                  </Badge>
                </div>
                <div>
                  <Label>Attendance Rate</Label>
                  <p className="text-gray-600">
                    {selectedMember.attendance_summary.attendance_rate}% (
                    {selectedMember.attendance_summary.attended}/
                    {selectedMember.attendance_summary.total_sessions})
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge
                    variant="outline"
                    className={
                      selectedMember.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {selectedMember.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Other Roles</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMember.other_roles?.length > 0 ? (
                    selectedMember.other_roles.map((role: any) => (
                      <Badge key={role.eschool_id} variant="secondary">
                        {role.eschool_name} ({role.role})
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-600">No other roles</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Member Details</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    Gender: {selectedMember.member_details?.gender || "-"}
                  </div>
                  <div>
                    Date of Birth:{" "}
                    {selectedMember.member_details?.date_of_birth || "-"}
                  </div>
                  <div>Phone: {selectedMember.phone || "-"}</div>
                  <div>
                    Address: {selectedMember.member_details?.address || "-"}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update member role</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">
              Edit role form would go here
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Role Removal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this role from the user? This
              action cannot be undone.
              {selectedMember && (
                <div className="mt-2 p-2 bg-red-50 rounded">
                  <div>
                    <span className="font-medium">User:</span>{" "}
                    {selectedMember.name}
                  </div>
                  <div>
                    <span className="font-medium">Role:</span>{" "}
                    {selectedMember.role_in_eschool}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMember}
              disabled={isRemoving}
            >
              {isRemoving ? "Removing..." : "Remove Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberManagementPage;
