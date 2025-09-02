'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchEschool, updateEschool } from '@/app/dashboard/eschool/services/eschoolService'
import { Eschool } from '@/app/dashboard/eschool/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft, User } from 'lucide-react'
import { toast } from 'sonner'

export default function EschoolRoleManagementPage() {
  const params = useParams()
  const router = useRouter()
  const eschoolId = Array.isArray(params.id) ? parseInt(params.id[0]) : parseInt(params.id)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<'coordinator' | 'treasurer' | null>(null)
  const [userId, setUserId] = useState('')
  const queryClient = useQueryClient()

  // Fetch eschool
  const { data: eschool, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['eschool', eschoolId],
    queryFn: () => fetchEschool(eschoolId),
    enabled: !isNaN(eschoolId)
  })

  // Update eschool mutation
  const updateMutation = useMutation({
    mutationFn: updateEschool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eschool', eschoolId] })
      setIsEditDialogOpen(false)
      setUserId('')
      toast.success('Role updated successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to update role', {
        description: error?.message || 'An unexpected error occurred',
      })
    },
  })

  const handleEditRole = (role: 'coordinator' | 'treasurer') => {
    setEditingRole(role)
    setUserId(
      role === 'coordinator' 
        ? (eschool?.coordinator_id?.toString() || '') 
        : (eschool?.treasurer_id?.toString() || '')
    )
    setIsEditDialogOpen(true)
  }

  const handleUpdateRole = () => {
    if (!editingRole) return
    
    const updateData = editingRole === 'coordinator' 
      ? { coordinator_id: userId ? parseInt(userId) : null } 
      : { treasurer_id: userId ? parseInt(userId) : null }
      
    updateMutation.mutate({ id: eschoolId, data: updateData })
  }

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
              {error?.message || "Failed to load eschool details"}
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
            <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
            <p className="text-muted-foreground">Assign roles for this eschool</p>
          </div>
        </div>
      </div>

      {/* Roles */}
      <div className="px-4 lg:px-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-1/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : eschool ? (
          <div className="space-y-6">
            {/* Coordinator */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Coordinator</CardTitle>
                    <CardDescription>
                      The coordinator manages this eschool's activities
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleEditRole('coordinator')}>
                    {eschool.coordinator ? "Change" : "Assign"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {eschool.coordinator ? (
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{eschool.coordinator.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {eschool.coordinator.id}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No coordinator assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Treasurer */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Treasurer</CardTitle>
                    <CardDescription>
                      The treasurer manages this eschool's finances
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => handleEditRole('treasurer')}>
                    {eschool.treasurer ? "Change" : "Assign"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {eschool.treasurer ? (
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{eschool.treasurer.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {eschool.treasurer.id}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No treasurer assigned</p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Eschool Not Found</AlertTitle>
            <AlertDescription>
              The requested eschool could not be found.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole === 'coordinator' ? "Assign Coordinator" : "Assign Treasurer"}
            </DialogTitle>
            <DialogDescription>
              {editingRole === 'coordinator' 
                ? "Enter the user ID to assign as coordinator for this eschool" 
                : "Enter the user ID to assign as treasurer for this eschool"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
                type="number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}