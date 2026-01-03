import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context, location }) => {
    const { auth } = useAuthStore.getState()
    
    // If user is authenticated, redirect to dashboard
    if (auth.user && auth.accessToken) {
      throw redirect({
        to: '/_authenticated',
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

