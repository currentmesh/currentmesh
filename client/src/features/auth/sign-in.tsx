import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { clientAuthApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Loader2 } from 'lucide-react'

export function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await clientAuthApi.requestMagicLink(email)
      setMessage({
        type: 'success',
        text: 'Magic link sent! Check your email.',
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Failed to send magic link',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-lg shadow-md border">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Client Portal Login</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email to receive a magic link
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Magic Link
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}


