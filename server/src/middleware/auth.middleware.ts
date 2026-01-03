import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader, JWTPayload } from '../utils/auth';
import { getPool } from '../config/database';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const payload = verifyAccessToken(token);

    // Verify user still exists in database
    const pool = getPool();
    const result = await pool.query(
      'SELECT id, email, organization_id, role, status FROM users WHERE id = $1',
      [payload.id]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      res.status(403).json({ error: 'User account is not active' });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      organizationId: user.organization_id,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof Error && error.message.includes('token')) {
      res.status(401).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Authentication error' });
  }
}

/**
 * Middleware to require super_admin role
 */
export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'super_admin') {
    res.status(403).json({ error: 'Super admin access required' });
    return;
  }

  next();
}

