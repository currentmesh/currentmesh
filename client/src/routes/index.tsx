import { createFileRoute, redirect } from '@tanstack/react-router'
import { useClientAuthStore } from '@/stores/client-auth-store'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context, location }) => {
    const { isAuthenticated } = useClientAuthStore.getState()

    // If user is authenticated, redirect to dashboard
    if (isAuthenticated) {
      throw redirect({
        to: '/dashboard',
        search: {
          redirect: location.href,
        },
      })
    }

    // If not authenticated, redirect to sign-in
    throw redirect({
      to: '/sign-in',
      search: {
        redirect: location.href,
      },
    })
  },
  component: () => null, // This will never render due to redirect
})
