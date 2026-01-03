/**
 * TypeScript types for Client Collaboration Portal
 */

export interface Client {
  id: number
  name: string
  email: string
  phone?: string
  company_name?: string
  organization_id: number
  created_at: string
  updated_at: string
}

export interface Request {
  id: number
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  client_id: number
  organization_id: number
  assigned_to?: number
  due_date?: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: number
  filename: string
  file_size: number
  mime_type: string
  request_id?: number
  client_id: number
  uploaded_by: number
  created_at: string
  updated_at: string
}

export interface ClientSession {
  token: string
  client: Client
}


