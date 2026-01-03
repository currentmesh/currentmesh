import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '@/stores/auth-store';

// Get API base URL from environment or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Create axios instance with authentication
 */
function createApiClient(): AxiosInstance {
  const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth token to requests
  api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
}

const api = createApiClient();

// ===== Admin API =====

export interface Organization {
  id: number;
  name: string;
  subdomain: string | null;
  status: 'active' | 'suspended' | 'cancelled';
  subscription_tier: 'free' | 'starter' | 'professional' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationInput {
  name: string;
  subdomain?: string;
  status?: 'active' | 'suspended' | 'cancelled';
  subscription_tier?: 'free' | 'starter' | 'professional' | 'enterprise';
}

export interface UpdateOrganizationInput {
  name?: string;
  subdomain?: string;
  status?: 'active' | 'suspended' | 'cancelled';
  subscription_tier?: 'free' | 'starter' | 'professional' | 'enterprise';
}

export interface User {
  id: number;
  organization_id: number;
  organization_name?: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended';
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  organization_id: number;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: 'user' | 'admin' | 'super_admin';
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  role?: 'user' | 'admin' | 'super_admin';
  status?: 'active' | 'inactive' | 'suspended';
}

export interface Client {
  id: number;
  organization_id: number;
  organization_name?: string;
  name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CreateClientInput {
  organization_id: number;
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface UpdateClientInput {
  name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  status?: 'active' | 'inactive' | 'archived';
}

// Organizations API
export const organizationsApi = {
  getAll: () => api.get<Organization[]>('/admin/organizations'),
  getById: (id: number) => api.get<Organization>(`/admin/organizations/${id}`),
  create: (data: CreateOrganizationInput) =>
    api.post<Organization>('/admin/organizations', data),
  update: (id: number, data: UpdateOrganizationInput) =>
    api.put<Organization>(`/admin/organizations/${id}`, data),
  delete: (id: number) => api.delete(`/admin/organizations/${id}`),
};

// Users API
export const usersApi = {
  getAll: () => api.get<User[]>('/admin/users'),
  getById: (id: number) => api.get<User>(`/admin/users/${id}`),
  create: (data: CreateUserInput) => api.post<User>('/admin/users', data),
  update: (id: number, data: UpdateUserInput) =>
    api.put<User>(`/admin/users/${id}`, data),
  delete: (id: number) => api.delete(`/admin/users/${id}`),
};

// Clients API
export const clientsApi = {
  getAll: () => api.get<Client[]>('/admin/clients'),
  getById: (id: number) => api.get<Client>(`/admin/clients/${id}`),
  create: (data: CreateClientInput) => api.post<Client>('/admin/clients', data),
  update: (id: number, data: UpdateClientInput) =>
    api.put<Client>(`/admin/clients/${id}`, data),
  delete: (id: number) => api.delete(`/admin/clients/${id}`),
};

// Auth API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: {
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: 'user' | 'admin' | 'super_admin';
    organization_id: number;
    organization_name?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),
  refresh: (refreshToken: string) => api.post<{ success: boolean; accessToken: string }>('/auth/refresh', { refreshToken }),
};

