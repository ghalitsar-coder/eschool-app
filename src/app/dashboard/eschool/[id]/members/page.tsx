'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchEschoolMembers, addMemberToEschool, removeMemberFromEschool } from '@/app/dashboard/eschool/[id]/members/services/memberService'
import { Member } from '@/app/dashboard/eschool/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Trash2, ArrowLeft, User } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function EschoolMemberManagementPage() {
  const params = useParams()
  const router = useRouter()
  const eschoolId = Array.isArray(params.id) ? parseInt(params.id[0]) : parseInt(params.id)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [memberId, setMemberId] = useState('')
  const queryClient = useQueryClient()

  // Fetch members
  const { data: members, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['eschool-members', eschoolId],
    queryFn: () => fetchEschoolMembers(eschoolId),
    enabled: !isNaN(eschoolId)
  })

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: addMemberToEschool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eschool-members', eschoolId] })
      setIsAddDialogOpen(false)
      setMemberId('')
      toast.success('Member added successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to add member', {
        description: error?.message || 'An unexpected error occurred',
      })
    },
  })

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: removeMemberFromEschool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eschool-members', eschoolId] })
      setIsRemoveDialogOpen(false)
      toast.success('Member removed successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to remove member', {
        description: error?.message || 'An unexpected error occurred',
      })
    },
  })

  const handleAddMember = () => {
    if (!memberId) {
      toast.error('Member ID is required')
      return
    }
    
    addMemberMutation.mutate({ eschoolId, memberId: parseInt(memberId) })
  }

  const handleRemoveMember = (member: Member) => {
    setSelectedMember(member)
    setIsRemoveDialogOpen(true)
  }

  const confirmRemoveMember = () => {
    if (!selectedMember) return
    removeMemberMutation.mutate({ eschoolId, memberId: selectedMember.id })
  }

  const filteredMembers = useMemo(() => {
    if (!members) return []
    
    return members.filter((member) => {
      const name = member.user?.name || member.name
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ""
      )
    })
  }, [members, searchTerm])

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
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Member</DialogTitle>
                <DialogDescription>
                  Add a new member to this eschool by entering their member ID
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="memberId">Member ID</Label>
                  <Input
                    id="memberId"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    placeholder="Enter member ID"
                    type="number"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMember} disabled={addMemberMutation.isPending}>
                  {addMemberMutation.isPending ? "Adding..." : "Add Member"}
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
                <CardDescription>Members enrolled in this eschool</CardDescription>
              </div>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {searchTerm
                          ? "No members found matching your search."
                          : "No members enrolled yet."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            {member.user?.name || member.name}
                          </div>
                        </TableCell>
                        <TableCell>{member.student_id}</TableCell>
                        <TableCell>
                          <Badge variant={member.is_active ? "default" : "secondary"}>
                            {member.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member)}
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
            <DialogTitle>Confirm Removal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member from the eschool? This action cannot be undone.
              {selectedMember && (
                <div className="mt-2 p-2 bg-red-50 rounded">
                  <span className="font-medium">Member:</span> {selectedMember.user?.name || selectedMember.name}
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
              onClick={confirmRemoveMember} 
              disabled={removeMemberMutation.isPending}
            >
              {removeMemberMutation.isPending ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}