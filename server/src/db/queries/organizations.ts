import { getPool } from '../../config/database';

export interface Organization {
  id: number;
  name: string;
  subdomain: string | null;
  status: 'active' | 'suspended' | 'cancelled';
  subscription_tier: 'free' | 'starter' | 'professional' | 'enterprise';
  created_at: Date;
  updated_at: Date;
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

/**
 * Get all organizations (super admin only)
 */
export async function getAllOrganizations(): Promise<Organization[]> {
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM organizations ORDER BY created_at DESC'
  );
  return result.rows;
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(id: number): Promise<Organization | null> {
  const pool = getPool();
  const result = await pool.query('SELECT * FROM organizations WHERE id = $1', [id]);
  return result.rows[0] || null;
}

/**
 * Create new organization
 */
export async function createOrganization(
  input: CreateOrganizationInput
): Promise<Organization> {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO organizations (name, subdomain, status, subscription_tier)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      input.name,
      input.subdomain || null,
      input.status || 'active',
      input.subscription_tier || 'free',
    ]
  );
  return result.rows[0];
}

/**
 * Update organization
 */
export async function updateOrganization(
  id: number,
  input: UpdateOrganizationInput
): Promise<Organization | null> {
  const pool = getPool();
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (input.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(input.name);
  }
  if (input.subdomain !== undefined) {
    updates.push(`subdomain = $${paramIndex++}`);
    values.push(input.subdomain || null);
  }
  if (input.status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(input.status);
  }
  if (input.subscription_tier !== undefined) {
    updates.push(`subscription_tier = $${paramIndex++}`);
    values.push(input.subscription_tier);
  }

  if (updates.length === 0) {
    return getOrganizationById(id);
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE organizations SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

/**
 * Delete organization (cascade will handle related data)
 */
export async function deleteOrganization(id: number): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query('DELETE FROM organizations WHERE id = $1', [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

