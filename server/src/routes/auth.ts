import { Router, Request, Response } from 'express';
import { getPool } from '../config/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, JWTPayload } from '../utils/auth';
import { logger } from '../utils/logger';
import bcrypt from 'bcrypt';

const router = Router();

/**
 * POST /api/auth/login
 * Authenticate user and return JWT tokens
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const pool = getPool();

    // Find user by email (check all organizations since email is unique per org)
    // For super_admin, we might want to check across all orgs
    const result = await pool.query(
      `SELECT u.*, o.name as organization_name
       FROM users u
       LEFT JOIN organizations o ON u.organization_id = o.id
       WHERE u.email = $1
       ORDER BY u.created_at DESC
       LIMIT 1`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      logger.warn('Login attempt with invalid email', { email });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      logger.warn('Login attempt with inactive account', { email, status: user.status });
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      logger.warn('Login attempt with invalid password', { email });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      organizationId: user.organization_id,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    logger.info('User logged in successfully', { 
      email: user.email, 
      role: user.role,
      organization_id: user.organization_id 
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        organization_id: user.organization_id,
        organization_name: user.organization_name,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token (this will throw if invalid)
    const payload = verifyRefreshToken(refreshToken);

    // Verify user still exists and is active
    const pool = getPool();
    const result = await pool.query(
      'SELECT id, email, organization_id, role, status FROM users WHERE id = $1',
      [payload.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Generate new access token
    const newPayload: JWTPayload = {
      id: user.id,
      email: user.email,
      organizationId: user.organization_id,
      role: user.role,
    };

    const accessToken = generateAccessToken(newPayload);

    res.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

export default router;

