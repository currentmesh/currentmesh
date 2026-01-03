import { getPool } from '../../config/database';

export interface Client {
  id: number;
  organization_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  status: 'active' | 'inactive' | 'archived';
  created_at: Date;
  updated_at: Date;
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

/**
 * Get all clients across all organizations (super admin only)
 */
export async function getAllClients(): Promise<Client[]> {
  const pool = getPool();
  const result = await pool.query(
    `SELECT c.*, o.name as organization_name
     FROM clients c
     LEFT JOIN organizations o ON c.organization_id = o.id
     ORDER BY c.created_at DESC`
  );
  return result.rows.map((row) => ({
    ...row,
    organization_name: row.organization_name,
  }));
}

/**
 * Get clients by organization ID
 */
export async function getClientsByOrganization(organizationId: number): Promise<Client[]> {
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM clients WHERE organization_id = $1 ORDER BY created_at DESC',
    [organizationId]
  );
  return result.rows;
}

/**
 * Get client by ID
 */
export async function getClientById(id: number): Promise<Client | null> {
  const pool = getPool();
  const result = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
  return result.rows[0] || null;
}

/**
 * Create new client
 */
export async function createClient(input: CreateClientInput): Promise<Client> {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO clients (organization_id, name, email, phone, company_name, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      input.organization_id,
      input.name,
      input.email || null,
      input.phone || null,
      input.company_name || null,
      input.status || 'active',
    ]
  );
  return result.rows[0];
}

/**
 * Update client
 */
export async function updateClient(id: number, input: UpdateClientInput): Promise<Client | null> {
  const pool = getPool();
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (input.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(input.name);
  }
  if (input.email !== undefined) {
    updates.push(`email = $${paramIndex++}`);
    values.push(input.email || null);
  }
  if (input.phone !== undefined) {
    updates.push(`phone = $${paramIndex++}`);
    values.push(input.phone || null);
  }
  if (input.company_name !== undefined) {
    updates.push(`company_name = $${paramIndex++}`);
    values.push(input.company_name || null);
  }
  if (input.status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(input.status);
  }

  if (updates.length === 0) {
    return getClientById(id);
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE clients SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

/**
 * Delete client
 */
export async function deleteClient(id: number): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query('DELETE FROM clients WHERE id = $1', [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

