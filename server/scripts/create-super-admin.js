const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
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
    const passwordHash = await bcrypt.hash(password, 10);

    if (userCheck.rows.length > 0) {
      console.log('User already exists, updating password and role...');
      await pool.query(
        'UPDATE users SET password_hash = $1, role = $2, status = $3, first_name = $4 WHERE email = $5',
        [passwordHash, 'super_admin', 'active', 'Mario', 'mario@currentmesh.com']
      );
      console.log('✅ Super admin user updated successfully!');
    } else {
      console.log('Creating super admin user...');
      const result = await pool.query(
        'INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, role',
        [1, 'mario@currentmesh.com', passwordHash, 'Mario', null, 'super_admin', 'active']
      );
      console.log('✅ Super admin user created successfully!');
      console.log('User:', result.rows[0]);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();

