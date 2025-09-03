'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { multiRoleMemberApi } from '@/app/dashboard/eschool/[id]/members/services/multiRoleMemberService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Trash2, ArrowLeft, User } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

// Types
interface UserEschoolRole {
  user_id: number;
  name: string;
  email: string;
  student_id: string;
  phone: string;
  role_in_eschool: string;
  permissions: string[];
  status: string;
  assigned_at: string;
  member_details: {
    gender: string | null;
    address: string | null;
    date_of_birth: string | null;
  };
  other_roles: Array<{
    eschool_id: number;
    eschool_name: string;
    role: string;
  }>;
  attendance_summary: {
    total_sessions: number;
    attended: number;
    attendance_rate: number;
  };
}

interface AvailableUser {
  id: number;
  name: string;
  email: string;
  base_role: string;
  current_eschool_roles: Array<{
    eschool_id: number;
    eschool_name: string;
    role: string;
  }>;
  available_roles: string[];
  qwen_compliant: boolean;
  can_assign_koordinator: boolean;
}

export default function EschoolMemberManagementPage() {
  const params = useParams()
  const router = useRouter()
  const eschoolId = Array.isArray(params.id) ? parseInt(params.id[0]) : parseInt(params.id)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<UserEschoolRole | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedRole, setSelectedRole] = useState('member')
  const [studentId, setStudentId] = useState('')
  const queryClient = useQueryClient()

  // Fetch members
  const { data: membersResponse, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['eschool-members', eschoolId, roleFilter],
    queryFn: () => multiRoleMemberApi.getMembers(eschoolId, { 
      page: 1, 
      per_page: 100, // Get all for now, can be paginated later
      search: searchTerm,
      role_filter: roleFilter
    }),
    enabled: !isNaN(eschoolId)
  })

  // Fetch available users
  const { data: availableUsersResponse } = useQuery({
    queryKey: ['available-users', eschoolId],
    queryFn: () => multiRoleMemberApi.getAvailableUsers(eschoolId),
    enabled: !isNaN(eschoolId) && isAddDialogOpen
  })

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: (data: { user_id: number; role: string; member_details?: { student_id: string } }) => 
      multiRoleMemberApi.assignRole(eschoolId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eschool-members', eschoolId] })
      queryClient.invalidateQueries({ queryKey: ['available-users', eschoolId] })
      setIsAddDialogOpen(false)
      setSelectedUserId(null)
      setSelectedRole('member')
      setStudentId('')
      toast.success('Role assigned successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to assign role', {
        description: error?.message || 'An unexpected error occurred',
      })
    },
  })

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: (userId: number) => multiRoleMemberApi.removeRole(eschoolId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eschool-members', eschoolId] })
      toast.success('Role removed successfully')
      setIsRemoveDialogOpen(false)
    },
    onError: (error: any) => {
      toast.error('Failed to remove role', {
        description: error?.message || 'An unexpected error occurred',
      })
    },
  })

  const handleAssignRole = () => {
    if (!selectedUserId) {
      toast.error('Please select a user')
      return
    }
    
    const data: any = {
      user_id: selectedUserId,
      role: selectedRole,
    }
    
    // Add member details if role is member or bendahara
    if (selectedRole !== 'koordinator' && studentId) {
      data.member_details = {
        student_id: studentId
      }
    }
    
    assignRoleMutation.mutate(data)
  }

  const handleRemoveRole = (member: UserEschoolRole) => {
    setSelectedMember(member)
    setIsRemoveDialogOpen(true)
  }

  const confirmRemoveRole = () => {
    if (!selectedMember) return
    removeRoleMutation.mutate(selectedMember.user_id)
  }

  const filteredMembers = useMemo(() => {
    if (!membersResponse?.data) return []
    
    return membersResponse.data.filter((member) => {
      return (
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }, [membersResponse, searchTerm])

  const availableUsers = availableUsersResponse?.data || []

  if (isNaN(eschoolId)) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Invalid Eschool ID</AlertTitle>
            <AlertDescription>
              The eschool ID provided is not valid.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error?.message || "Failed to load members"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Member Management</h1>
            <p className="text-muted-foreground">Manage members in this eschool</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Role</DialogTitle>
                <DialogDescription>
                  Assign a role to a user in this eschool
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user">User</Label>
                  <Select 
                    value={selectedUserId?.toString() || ''} 
                    onValueChange={(value) => setSelectedUserId(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={selectedRole} 
                    onValueChange={setSelectedRole}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="bendahara">Bendahara</SelectItem>
                      <SelectItem value="koordinator">Koordinator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {(selectedRole === 'member' || selectedRole === 'bendahara') && (
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="Enter student ID"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignRole} disabled={assignRoleMutation.isPending}>
                  {assignRoleMutation.isPending ? "Assigning..." : "Assign Role"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Members Table */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Members</CardTitle>
                <CardDescription>Members and roles in this eschool</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="bendahara">Bendahara</SelectItem>
                    <SelectItem value="koordinator">Koordinator</SelectItem>
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
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
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
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {searchTerm || roleFilter !== 'all'
                          ? "No members found matching your search."
                          : "No members assigned yet."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.user_id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div>{member.name}</div>
                              <div className="text-sm text-muted-foreground">{member.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{member.student_id}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              member.role_in_eschool === 'koordinator' ? 'default' :
                              member.role_in_eschool === 'bendahara' ? 'secondary' : 'outline'
                            }
                          >
                            {member.role_in_eschool}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{member.attendance_summary.attendance_rate}%</span>
                            <span className="text-xs text-muted-foreground">
                              ({member.attendance_summary.attended}/{member.attendance_summary.total_sessions})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRole(member)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Remove Confirmation Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Role Removal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this role from the user? This action cannot be undone.
              {selectedMember && (
                <div className="mt-2 p-2 bg-red-50 rounded">
                  <div><span className="font-medium">User:</span> {selectedMember.name}</div>
                  <div><span className="font-medium">Role:</span> {selectedMember.role_in_eschool}</div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRemoveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmRemoveRole} 
              disabled={removeRoleMutation.isPending}
            >
              {removeRoleMutation.isPending ? "Removing..." : "Remove Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}