/**
 * API client for Client Collaboration Portal
 * Base URL: http://localhost:3000/api (development)
 */

import axios, { AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export interface ApiError {
  message: string
  status?: number
}

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Client Authentication API
 */
export const clientAuthApi = {
  /**
   * Request magic link for client login
   */
  async requestMagicLink(email: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/client-auth/magic-link/send', { email })
    return response.data
  },

  /**
   * Verify magic link token
   */
  async verifyToken(token: string): Promise<{ success: boolean; token?: string; client?: any }> {
    const response = await apiClient.post('/client-auth/magic-link/verify', { token })
    return response.data
  },
}

/**
 * Client Portal API
 */
export const clientPortalApi = {
  /**
   * Get client's requests
   */
  async getRequests(): Promise<any[]> {
    const response = await apiClient.get('/client/requests')
    return response.data
  },

  /**
   * Get request details
   */
  async getRequest(id: string): Promise<any> {
    const response = await apiClient.get(`/client/requests/${id}`)
    return response.data
  },

  /**
   * Upload document to request
   */
  async uploadDocument(requestId: string, file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post(`/client/requests/${requestId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Get client's documents
   */
  async getDocuments(): Promise<any[]> {
    const response = await apiClient.get('/client/documents')
    return response.data
  },
}

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('client_token')
}

/**
 * Set auth token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('client_token', token)
  }
}

/**
 * Remove auth token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('client_token')
  }
}

export { apiClient }


