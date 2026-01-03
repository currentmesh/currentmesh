/**
 * Authentication utilities for Client Collaboration Portal
 */

import { setAuthToken, removeAuthToken } from './api';

export interface ClientSession {
  token: string;
  client: {
    id: number;
    name: string;
    email: string;
  };
}

/**
 * Store client session
 */
export function storeClientSession(session: ClientSession): void {
  setAuthToken(session.token);
  if (typeof window !== 'undefined') {
    localStorage.setItem('client_data', JSON.stringify(session.client));
  }
}

/**
 * Get client session data
 */
export function getClientSession(): ClientSession | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('client_token');
  const clientData = localStorage.getItem('client_data');
  
  if (!token || !clientData) return null;
  
  try {
    return {
      token,
      client: JSON.parse(clientData),
    };
  } catch {
    return null;
  }
}

/**
 * Clear client session
 */
export function clearClientSession(): void {
  removeAuthToken();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('client_data');
  }
}

/**
 * Check if client is authenticated
 */
export function isClientAuthenticated(): boolean {
  return getClientSession() !== null;
}


