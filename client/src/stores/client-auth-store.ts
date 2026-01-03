/**
 * Client Authentication Store (Zustand)
 */

import { create } from 'zustand'
import { getClientSession, clearClientSession, storeClientSession, type ClientSession } from '@/lib/auth'

interface ClientAuthState {
  session: ClientSession | null
  isAuthenticated: boolean
  auth: {
    setSession: (session: ClientSession) => void
    reset: () => void
    checkAuth: () => void
  }
}

export const useClientAuthStore = create<ClientAuthState>((set) => ({
  session: null,
  isAuthenticated: false,
  auth: {
    setSession: (session: ClientSession) => {
      storeClientSession(session)
      set({ session, isAuthenticated: true })
    },
    reset: () => {
      clearClientSession()
      set({ session: null, isAuthenticated: false })
    },
    checkAuth: () => {
      const session = getClientSession()
      set({ session, isAuthenticated: !!session })
    },
  },
}))

// Initialize auth state on store creation
if (typeof window !== 'undefined') {
  useClientAuthStore.getState().auth.checkAuth()
}


