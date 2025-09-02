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
import {
  Badge,
} from "@/components/ui/badge";
import { Search, Plus, Eye, Edit, Trash2, Filter, AlertCircle } from "lucide-react";
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
  const [createNewUser, setCreateNewUser] = useState(false);
  
  // Form state for creating member
  const [newMemberForm, setNewMemberForm] = useState({
    // New user fields
    new_user_name: '',
    new_user_email: '',
    new_user_password: '',
    // Existing user field
    existing_user_id: '',
    // Member details
    nip: '',
    name: '',
    student_id: '',
    date_of_birth: '',
    gender: '',
    address: '',
    phone: '',
    email: '',
    status: 'active',
    // Staff fields
    eschool_ids: [] as number[],
  });

  const {
    members,
    schools,
    eschools,
    users: availableUsers,
    pagination,
    isLoadingMembers,
    isLoadingSchools,
    isLoadingEschools,
    isLoadingUsers,
    isCreating,
    isUpdating,
    isDeleting,
    membersError,
    schoolsError,
    eschoolsError,
    usersError,
    createError,
    updateError,
    deleteError,
    fetchMembers,
    fetchSchools,
    fetchEschools,
    fetchAvailableUsers,
    createMember,
    updateMember,
    deleteMember,
  } = useMemberManagement({
    page: currentPage,
    perPage: 15,
    search: searchTerm,
    userRole: user?.role,
  });

  // Note: The backend automatically filters members by school for coordinators and staff
  // For coordinators: Only members from the same school as the coordinator's eschool
  // For staff: Only members from the staff's assigned school

 

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
      if (!selectedMember) return;
      await deleteMember(selectedMember.id);
      setIsDeleteDialogOpen(false);
      fetchMembers();
      toast.success("Member deleted successfully");
    } catch (error: any) {
      console.error("Error deleting member:", error);
      toast.error("Failed to delete member", {
        description: error?.message || "An unexpected error occurred",
      });
    }
  };

  const handleCreateMember = async () => {
    try {
      const createData = {
        create_new_user: createNewUser,
        ...(createNewUser ? {
          new_user_name: newMemberForm.new_user_name,
          new_user_email: newMemberForm.new_user_email,
          new_user_password: newMemberForm.new_user_password,
        } : {
          existing_user_id: parseInt(newMemberForm.existing_user_id),
        }),
        ...(user?.role === 'staff' ? { eschool_ids: newMemberForm.eschool_ids } : {}),
        nip: newMemberForm.nip || undefined,
        name: newMemberForm.name,
        student_id: newMemberForm.student_id || undefined,
        date_of_birth: newMemberForm.date_of_birth || undefined,
        gender: newMemberForm.gender || undefined,
        address: newMemberForm.address || undefined,
        phone: newMemberForm.phone || undefined,
        email: newMemberForm.email || undefined,
        status: newMemberForm.status,
      };

      await createMember(createData);
      setIsCreateDialogOpen(false);
      fetchMembers();
      toast.success("Member created successfully");
      
      // Reset form
      setNewMemberForm({
        new_user_name: '',
        new_user_email: '',
        new_user_password: '',
        existing_user_id: '',
        nip: '',
        name: '',
        student_id: '',
        date_of_birth: '',
        gender: '',
        address: '',
        phone: '',
        email: '',
        status: 'active',
        eschool_ids: [],
      });
    } catch (error: any) {
      console.error("Error creating member:", error);
      toast.error("Failed to create member", {
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
              <h1 className="text-2xl font-bold tracking-tight">Member Management</h1>
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
            <h1 className="text-2xl font-bold tracking-tight">Member Management</h1>
            <p className="text-muted-foreground">Manage eschool members</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            {(user.role === 'koordinator' || user.role === 'staff') && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateMember();
                  }}>
                    <DialogHeader>
                      <DialogTitle>Add New Member</DialogTitle>
                      <DialogDescription>
                        Create a new member for your eschool
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="createNewUser"
                            checked={createNewUser}
                            onChange={(e) => setCreateNewUser(e.target.checked)}
                            className="h-4 w-4"
                          />
                          <label htmlFor="createNewUser" className="text-sm font-medium">
                            Create new user account
                          </label>
                        </div>
                        
                        {createNewUser ? (
                          <div className="space-y-3">
                            <h4 className="font-medium">New User Details</h4>
                            <div>
                              <label className="text-sm font-medium">Name</label>
                              <input
                                type="text"
                                placeholder="Full name"
                                className="w-full px-3 py-2 border rounded-md"
                                value={newMemberForm.new_user_name}
                                onChange={(e) => setNewMemberForm({...newMemberForm, new_user_name: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Email</label>
                              <input
                                type="email"
                                placeholder="Email address"
                                className="w-full px-3 py-2 border rounded-md"
                                value={newMemberForm.new_user_email}
                                onChange={(e) => setNewMemberForm({...newMemberForm, new_user_email: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Password</label>
                              <input
                                type="password"
                                placeholder="Password"
                                className="w-full px-3 py-2 border rounded-md"
                                value={newMemberForm.new_user_password}
                                onChange={(e) => setNewMemberForm({...newMemberForm, new_user_password: e.target.value})}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <h4 className="font-medium">Select Existing User</h4>
                            <div>
                              <label className="text-sm font-medium">User</label>
                              <select 
                                className="w-full px-3 py-2 border rounded-md"
                                value={newMemberForm.existing_user_id}
                                onChange={(e) => setNewMemberForm({...newMemberForm, existing_user_id: e.target.value})}
                              >
                                <option value="">Select a user</option>
                                {availableUsers?.map((user) => (
                                  <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-3">
                          <h4 className="font-medium">Member Details</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium">NIP</label>
                              <input
                                type="text"
                                placeholder="NIP"
                                className="w-full px-3 py-2 border rounded-md"
                                value={newMemberForm.nip}
                                onChange={(e) => setNewMemberForm({...newMemberForm, nip: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Student ID</label>
                              <input
                                type="text"
                                placeholder="Student ID"
                                className="w-full px-3 py-2 border rounded-md"
                                value={newMemberForm.student_id}
                                onChange={(e) => setNewMemberForm({...newMemberForm, student_id: e.target.value})}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Full Name</label>
                            <input
                              type="text"
                              placeholder="Full name"
                              className="w-full px-3 py-2 border rounded-md"
                              value={newMemberForm.name}
                              onChange={(e) => setNewMemberForm({...newMemberForm, name: e.target.value})}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium">Date of Birth</label>
                              <input
                                type="date"
                                className="w-full px-3 py-2 border rounded-md"
                                value={newMemberForm.date_of_birth}
                                onChange={(e) => setNewMemberForm({...newMemberForm, date_of_birth: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Gender</label>
                              <select 
                                className="w-full px-3 py-2 border rounded-md"
                                value={newMemberForm.gender}
                                onChange={(e) => setNewMemberForm({...newMemberForm, gender: e.target.value})}
                              >
                                <option value="">Select gender</option>
                                <option value="L">Male</option>
                                <option value="P">Female</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Address</label>
                            <textarea
                              placeholder="Address"
                              className="w-full px-3 py-2 border rounded-md"
                              rows={2}
                              value={newMemberForm.address}
                              onChange={(e) => setNewMemberForm({...newMemberForm, address: e.target.value})}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium">Phone</label>
                              <input
                                type="tel"
                                placeholder="Phone number"
                                className="w-full px-3 py-2 border rounded-md"
                                value={newMemberForm.phone}
                                onChange={(e) => setNewMemberForm({...newMemberForm, phone: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <select 
                                className="w-full px-3 py-2 border rounded-md"
                                value={newMemberForm.status}
                                onChange={(e) => setNewMemberForm({...newMemberForm, status: e.target.value})}
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            </div>
                          </div>
                          {/* For koordinator, eschool is automatically set and not shown */}
                          {user?.role === 'staff' && eschools && eschools.length > 0 && (
                            <div>
                              <label className="text-sm font-medium">Eschools</label>
                              <select 
                                multiple 
                                className="w-full px-3 py-2 border rounded-md"
                                value={newMemberForm.eschool_ids.map(String)}
                                onChange={(e) => {
                                  const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                  setNewMemberForm({...newMemberForm, eschool_ids: selected});
                                }}
                              >
                                <option value="">Select eschools</option>
                                {eschools?.map((eschool) => (
                                  <option key={eschool.id} value={eschool.id}>
                                    {eschool.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} type="button">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCreating}>
                        {isCreating ? 'Saving...' : 'Save'}
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
      {(membersError || schoolsError || eschoolsError || usersError || createError || updateError || deleteError) && (
        <div className="px-4 lg:px-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {membersError && <div>Members: {membersError.message}</div>}
              {schoolsError && <div>Schools: {schoolsError.message}</div>}
              {eschoolsError && <div>Eschools: {eschoolsError.message}</div>}
              {usersError && <div>Users: {usersError.message}</div>}
              {createError && <div>Create: {createError.message}</div>}
              {updateError && <div>Update: {updateError.message}</div>}
              {deleteError && <div>Delete: {deleteError.message}</div>}
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
                      <TableHead>Name</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Eschools</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members && members.length > 0 ? (
                      members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="font-medium">{member.name || member.user?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.nip && `NIP: ${member.nip}`}
                            </div>
                          </TableCell>
                          <TableCell>{member.student_id || "-"}</TableCell>
                          <TableCell>{member.user?.email || member.email || "-"}</TableCell>
                          <TableCell>{member.school?.name || "-"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {member.eschools?.slice(0, 2).map((eschool: any) => (
                                <Badge key={eschool.id} variant="secondary" className="text-xs">
                                  {eschool.name}
                                </Badge>
                              ))}
                              {member.eschools?.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{member.eschools.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={member.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                            >
                              {member.is_active ? "Active" : "Inactive"}
                            </Badge>
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
                              {(user.role === 'koordinator' || user.role === 'staff') && (
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
                                    onClick={() => handleDeleteMemberPrompt(member)}
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
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchTerm
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
                      Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{" "}
                      {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{" "}
                      {pagination.total} members
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, pagination.current_page - 1))}
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
                        onClick={() => setCurrentPage(Math.min(pagination.last_page, pagination.current_page + 1))}
                        disabled={pagination.current_page === pagination.last_page}
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
                  <p className="text-gray-600">{selectedMember.name || selectedMember.user?.name}</p>
                </div>
                <div>
                  <Label>Student ID</Label>
                  <p className="text-gray-600">{selectedMember.student_id || "-"}</p>
                </div>
                <div>
                  <Label>NIP</Label>
                  <p className="text-gray-600">{selectedMember.nip || "-"}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-gray-600">{selectedMember.phone || "-"}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-gray-600">{selectedMember.user?.email || selectedMember.email || "-"}</p>
                </div>
                <div>
                  <Label>Gender</Label>
                  <p className="text-gray-600">
                    {selectedMember.gender === "L" ? "Male" : selectedMember.gender === "P" ? "Female" : "-"}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge
                    variant="outline"
                    className={selectedMember.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {selectedMember.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <Label>School</Label>
                  <p className="text-gray-600">{selectedMember.school?.name || "-"}</p>
                </div>
              </div>
              <div>
                <Label>Eschools</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMember.eschools?.map((eschool: any) => (
                    <Badge key={eschool.id} variant="secondary">
                      {eschool.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <p className="text-gray-600">{selectedMember.address || "-"}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update member information
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">Edit member form would go here</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMember} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberManagementPage;