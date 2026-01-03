import { useQuery } from '@tanstack/react-query'
import { useClientAuthStore } from '@/stores/client-auth-store'
import { clientPortalApi } from '@/lib/api'
import type { Request } from '@/types/portal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

export function Dashboard() {
  const { session } = useClientAuthStore()

  const { data: requests, isLoading } = useQuery<Request[]>({
    queryKey: ['client-requests'],
    queryFn: () => clientPortalApi.getRequests(),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          {session?.client && (
            <p className="mt-2 text-muted-foreground">
              Welcome, {session.client.name} ({session.client.email})
            </p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Requests</CardTitle>
            <CardDescription>View and manage your document requests</CardDescription>
          </CardHeader>
          <CardContent>
            {!requests || requests.length === 0 ? (
              <p className="text-muted-foreground">No requests found.</p>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{request.title}</h3>
                          {request.description && (
                            <p className="mt-1 text-sm text-muted-foreground">{request.description}</p>
                          )}
                          {request.due_date && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Due: {new Date(request.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


