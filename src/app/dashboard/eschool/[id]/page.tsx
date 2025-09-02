'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { fetchEschool } from '@/app/dashboard/eschool/services/eschoolService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft, Users, User, Calendar } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth'

export default function EschoolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const eschoolId = Array.isArray(params.id) ? parseInt(params.id[0]) : parseInt(params.id)

  // Fetch eschool
  const { data: eschool, isLoading, isError, error } = useQuery({
    queryKey: ['eschool', eschoolId],
    queryFn: () => fetchEschool(eschoolId),
    enabled: !isNaN(eschoolId)
  })

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
            <h1 className="text-2xl font-bold tracking-tight">Eschool Details</h1>
            <p className="text-muted-foreground">View and manage eschool information</p>
          </div>
          <div className="flex gap-2">
            {["staff"].includes(user?.role || '') && (
              <>
                <Button onClick={() => router.push(`/eschool/${eschoolId}/members`)}>
                  <Users className="h-4 w-4 mr-2" />
                  Manage Members
                </Button>
                <Button variant="outline" onClick={() => router.push(`/eschool/${eschoolId}/roles`)}>
                  <User className="h-4 w-4 mr-2" />
                  Manage Roles
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-6">
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ) : eschool ? (
          <div className="space-y-6">
            {/* Eschool Info */}
            <Card>
              <CardHeader>
                <CardTitle>{eschool.name}</CardTitle>
                <CardDescription>
                  {eschool.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Members</p>
                      <p className="text-xl font-bold">{eschool.members_count}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Coordinator</p>
                      <p className="font-medium">
                        {eschool.coordinator ? eschool.coordinator.name : "Not assigned"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Treasurer</p>
                      <p className="font-medium">
                        {eschool.treasurer ? eschool.treasurer.name : "Not assigned"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Schedule Days</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {eschool.schedule_days && Array.isArray(eschool.schedule_days) && eschool.schedule_days.length > 0 ? (
                          eschool.schedule_days.map((day, index) => (
                            <span key={index} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              {day}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
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
    </div>
  )
}