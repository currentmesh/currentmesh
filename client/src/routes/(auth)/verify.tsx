import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { clientAuthApi } from '@/lib/api'
import { useClientAuthStore } from '@/stores/client-auth-store'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

const searchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/verify')({
  validateSearch: searchSchema,
  component: VerifyPage,
})

function VerifyPage() {
  const navigate = useNavigate()
  const { token } = useSearch({ from: '/(auth)/verify' })
  const { auth } = useClientAuthStore()
  const [loading, setLoading] = useState(!!token)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('No verification token provided')
      setLoading(false)
      return
    }

    const verifyToken = async () => {
      try {
        const response = await clientAuthApi.verifyToken(token)
        if (response.success && response.token && response.client) {
          auth.setSession({
            token: response.token,
            client: response.client,
          })
          setSuccess(true)
          setTimeout(() => {
            navigate({ to: '/dashboard' })
          }, 2000)
        } else {
          setError('Invalid or expired token')
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Verification failed')
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [token, auth, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verifying your token...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-4 p-8 bg-card rounded-lg shadow-md border">
        {success ? (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-center">Verification Successful!</h2>
            <p className="text-center text-muted-foreground">
              Redirecting to your dashboard...
            </p>
          </>
        ) : (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-center">Verification Failed</h2>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              onClick={() => navigate({ to: '/(auth)/sign-in' })}
              className="w-full"
            >
              Back to Login
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
