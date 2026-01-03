import bcrypt from 'bcrypt';
import { getPool } from '../src/config/database';
import { createUser } from '../src/db/queries/users';
import { setupDatabase } from '../src/config/database';

async function createSuperAdmin() {
  try {
    // Initialize database connection
    await setupDatabase();
    const pool = getPool();

    // Check if organization 1 exists (default CurrentMesh org)
    const orgResult = await pool.query('SELECT id FROM organizations WHERE id = 1');
    if (orgResult.rows.length === 0) {
      console.log('Creating default organization...');
      await pool.query(
        "INSERT INTO organizations (id, name, subdomain, status, subscription_tier) VALUES (1, 'CurrentMesh', 'default', 'active', 'enterprise')"
      );
    }

    // Check if user already exists
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', ['mario@currentmesh.com']);
    const password = '9QQ%NdK#jWyCJ5RysFtBAwJcDLAQ7HVgHof92C!nmhz$h4PQ9jmJh#';

    if (userCheck.rows.length > 0) {
      console.log('User already exists, updating password and role...');
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET password_hash = $1, role = $2, status = $3, first_name = $4 WHERE email = $5',
        [passwordHash, 'super_admin', 'active', 'Mario', 'mario@currentmesh.com']
      );
      console.log('✅ Super admin user updated successfully!');
    } else {
      console.log('Creating super admin user...');
      const user = await createUser({
        organization_id: 1,
        email: 'mario@currentmesh.com',
        password: password,
        first_name: 'Mario',
        role: 'super_admin',
        status: 'active',
      });
      console.log('✅ Super admin user created successfully!');
      console.log('User:', { id: user.id, email: user.email, role: user.role });
    }
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createSuperAdmin();

