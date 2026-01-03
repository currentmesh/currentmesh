import { getPool } from '../../config/database';
import bcrypt from 'bcrypt';

export interface User {
  id: number;
  organization_id: number;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended';
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
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

/**
 * Get all users across all organizations (super admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  const pool = getPool();
  const result = await pool.query(
    `SELECT u.*, o.name as organization_name
     FROM users u
     LEFT JOIN organizations o ON u.organization_id = o.id
     ORDER BY u.created_at DESC`
  );
  return result.rows.map((row) => ({
    ...row,
    organization_name: row.organization_name,
  }));
}

/**
 * Get users by organization ID
 */
export async function getUsersByOrganization(organizationId: number): Promise<User[]> {
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM users WHERE organization_id = $1 ORDER BY created_at DESC',
    [organizationId]
  );
  return result.rows;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User | null> {
  const pool = getPool();
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

/**
 * Get user by email and organization
 */
export async function getUserByEmail(
  email: string,
  organizationId: number
): Promise<User | null> {
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND organization_id = $2',
    [email, organizationId]
  );
  return result.rows[0] || null;
}

/**
 * Create new user
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  const pool = getPool();

  // Check if user already exists
  const existing = await getUserByEmail(input.email, input.organization_id);
  if (existing) {
    throw new Error('User with this email already exists in this organization');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, 10);

  const result = await pool.query(
    `INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      input.organization_id,
      input.email,
      passwordHash,
      input.first_name || null,
      input.last_name || null,
      input.role || 'user',
      input.status || 'active',
    ]
  );
  return result.rows[0];
}

/**
 * Update user
 */
export async function updateUser(id: number, input: UpdateUserInput): Promise<User | null> {
  const pool = getPool();
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (input.email !== undefined) {
    updates.push(`email = $${paramIndex++}`);
    values.push(input.email);
  }
  if (input.password !== undefined) {
    const passwordHash = await bcrypt.hash(input.password, 10);
    updates.push(`password_hash = $${paramIndex++}`);
    values.push(passwordHash);
  }
  if (input.first_name !== undefined) {
    updates.push(`first_name = $${paramIndex++}`);
    values.push(input.first_name || null);
  }
  if (input.last_name !== undefined) {
    updates.push(`last_name = $${paramIndex++}`);
    values.push(input.last_name || null);
  }
  if (input.role !== undefined) {
    updates.push(`role = $${paramIndex++}`);
    values.push(input.role);
  }
  if (input.status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(input.status);
  }

  if (updates.length === 0) {
    return getUserById(id);
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

/**
 * Delete user
 */
export async function deleteUser(id: number): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

