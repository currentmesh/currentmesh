/**
 * API client for Client Collaboration Portal
 * Base URL: http://localhost:3000/api (development)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ApiError {
  message: string;
  status?: number;
}

/**
 * Generic API request handler
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = {
      message: `API Error: ${response.statusText}`,
      status: response.status,
    };
    throw error;
  }

  return response.json();
}

/**
 * Client Authentication API
 */
export const clientAuthApi = {
  /**
   * Request magic link for client login
   */
  async requestMagicLink(email: string): Promise<{ success: boolean; message: string }> {
    return apiRequest('/client-auth/magic-link/send', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Verify magic link token
   */
  async verifyToken(token: string): Promise<{ success: boolean; token?: string; client?: any }> {
    return apiRequest('/client-auth/magic-link/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },
};

/**
 * Client Portal API
 */
export const clientPortalApi = {
  /**
   * Get client's requests
   */
  async getRequests(): Promise<any[]> {
    return apiRequest('/client/requests', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
  },

  /**
   * Get request details
   */
  async getRequest(id: string): Promise<any> {
    return apiRequest(`/client/requests/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
  },

  /**
   * Upload document to request
   */
  async uploadDocument(requestId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}/client/requests/${requestId}/upload`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get client's documents
   */
  async getDocuments(): Promise<any[]> {
    return apiRequest('/client/documents', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
  },
};

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('client_token');
}

/**
 * Set auth token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('client_token', token);
  }
}

/**
 * Remove auth token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('client_token');
  }
}

