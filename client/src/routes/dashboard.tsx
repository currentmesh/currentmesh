import { createFileRoute, redirect } from '@tanstack/react-router'
import { Dashboard } from '@/features/dashboard/dashboard'
import { useClientAuthStore } from '@/stores/client-auth-store'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    const { isAuthenticated } = useClientAuthStore.getState()
    
    if (!isAuthenticated) {
      throw redirect({
        to: '/(auth)/sign-in',
      })
    }
  },
  component: Dashboard,
})
