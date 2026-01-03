import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface JWTPayload {
  id: number;
  email: string;
  organizationId: number;
  role: string;
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: '15m', // 15 minutes
  });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: '7d', // 7 days
  });
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, config.jwt.secret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

