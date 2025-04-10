import jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';

/**
 * JWT utility functions for authentication
 */

// Define JWT payload types
export interface JwtPayload {
  id: number;
  role?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Set of blacklisted tokens (for logout functionality)
// Note: In production, this should be stored in Redis or database
const tokenBlacklist = new Set<string>();

/**
 * Generate JWT access token with user ID and role
 * @param userId User ID to include in the token
 * @param role User role for authorization
 * @returns JWT token string
 */
export const generateAccessToken = (userId: number, role?: string): string => {
  const payload: JwtPayload = { id: userId };
  if (role) payload.role = role;
  
  // Using a consistent secret key for development
  const secret = process.env.JWT_SECRET || 'cybersafe_jwt_secret_key_2025';
  // Increase token expiry to reduce frequent token expiration issues during testing
  const options: SignOptions = { expiresIn: '7d' }; // Set to 7 days for testing
  
  try {
    return jwt.sign(payload, secret, options);
  } catch (error) {
    console.error('Error generating access token:', error);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Generate refresh token with longer expiry
 * @param userId User ID to include in the token
 * @returns JWT refresh token string
 */
export const generateRefreshToken = (userId: number): string => {
  const payload: JwtPayload = { id: userId };
  // Using a consistent secret key for development
  const secret = process.env.JWT_SECRET || 'cybersafe_jwt_secret_key_2025';
  // Increase token expiry to reduce frequent token expiration issues during testing
  const options: SignOptions = { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ? parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN, 10) : '7d' };
  
  try {
    return jwt.sign(payload, secret, options);
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Generate both access and refresh tokens
 * @param userId User ID
 * @param role User role
 * @returns Object containing both tokens
 */
export const generateTokenPair = (userId: number, role?: string): TokenPair => {
  return {
    accessToken: generateAccessToken(userId, role),
    refreshToken: generateRefreshToken(userId)
  };
};

/**
 * Verify JWT access token
 * @param token JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyAccessToken = (token: string): JwtPayload | null => {
  // Check if token is blacklisted
  if (isTokenBlacklisted(token)) {
    console.log('Token is blacklisted');
    return null;
  }
  
  const secret = process.env.JWT_SECRET || 'cybersafe_jwt_secret_key_2025';
  
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    console.log('Token verification successful for user ID:', decoded.id);
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      console.error('Token expired at:', error.expiredAt);
    } else if (error.name === 'JsonWebTokenError') {
      console.error('JWT Error:', error.message);
    } else {
      console.error('Error verifying access token:', error);
    }
    return null;
  }
};

/**
 * Verify refresh token
 * @param token Refresh token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyRefreshToken = (token: string): JwtPayload | null => {
  const secret = process.env.JWT_SECRET || 'cybersafe_jwt_secret_key_2025';
  
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('Error verifying refresh token:', error);
    return null;
  }
};

/**
 * Add token to blacklist (for logout)
 * @param token Token to blacklist
 */
export const blacklistToken = (token: string): void => {
  tokenBlacklist.add(token);
};

/**
 * Check if token is blacklisted
 * @param token Token to check
 * @returns Boolean indicating if token is blacklisted
 */
export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};
