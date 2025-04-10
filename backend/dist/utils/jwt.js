"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenBlacklisted = exports.blacklistToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateTokenPair = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Set of blacklisted tokens (for logout functionality)
// Note: In production, this should be stored in Redis or database
const tokenBlacklist = new Set();
/**
 * Generate JWT access token with user ID and role
 * @param userId User ID to include in the token
 * @param role User role for authorization
 * @returns JWT token string
 */
const generateAccessToken = (userId, role) => {
    const payload = { id: userId };
    if (role)
        payload.role = role;
    // Using a consistent secret key for development
    const secret = process.env.JWT_SECRET || 'cybersafe_jwt_secret_key_2025';
    // Increase token expiry to reduce frequent token expiration issues during testing
    const options = { expiresIn: process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN, 10) : '24h' };
    try {
        return jsonwebtoken_1.default.sign(payload, secret, options);
    }
    catch (error) {
        console.error('Error generating access token:', error);
        throw new Error('Failed to generate authentication token');
    }
};
exports.generateAccessToken = generateAccessToken;
/**
 * Generate refresh token with longer expiry
 * @param userId User ID to include in the token
 * @returns JWT refresh token string
 */
const generateRefreshToken = (userId) => {
    const payload = { id: userId };
    // Using a consistent secret key for development
    const secret = process.env.JWT_SECRET || 'cybersafe_jwt_secret_key_2025';
    // Increase token expiry to reduce frequent token expiration issues during testing
    const options = { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ? parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN, 10) : '7d' };
    try {
        return jsonwebtoken_1.default.sign(payload, secret, options);
    }
    catch (error) {
        console.error('Error generating refresh token:', error);
        throw new Error('Failed to generate refresh token');
    }
};
exports.generateRefreshToken = generateRefreshToken;
/**
 * Generate both access and refresh tokens
 * @param userId User ID
 * @param role User role
 * @returns Object containing both tokens
 */
const generateTokenPair = (userId, role) => {
    return {
        accessToken: (0, exports.generateAccessToken)(userId, role),
        refreshToken: (0, exports.generateRefreshToken)(userId)
    };
};
exports.generateTokenPair = generateTokenPair;
/**
 * Verify JWT access token
 * @param token JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
const verifyAccessToken = (token) => {
    // Check if token is blacklisted
    if ((0, exports.isTokenBlacklisted)(token)) {
        console.log('Token is blacklisted');
        return null;
    }
    const secret = process.env.JWT_SECRET || 'cybersafe_jwt_secret_key_2025';
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        console.log('Token verification successful for user ID:', decoded.id);
        return decoded;
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.error('Token expired at:', error.expiredAt);
        }
        else if (error.name === 'JsonWebTokenError') {
            console.error('JWT Error:', error.message);
        }
        else {
            console.error('Error verifying access token:', error);
        }
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
/**
 * Verify refresh token
 * @param token Refresh token to verify
 * @returns Decoded token payload or null if invalid
 */
const verifyRefreshToken = (token) => {
    const secret = process.env.JWT_SECRET || 'cybersafe_jwt_secret_key_2025';
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        return decoded;
    }
    catch (error) {
        console.error('Error verifying refresh token:', error);
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
/**
 * Add token to blacklist (for logout)
 * @param token Token to blacklist
 */
const blacklistToken = (token) => {
    tokenBlacklist.add(token);
};
exports.blacklistToken = blacklistToken;
/**
 * Check if token is blacklisted
 * @param token Token to check
 * @returns Boolean indicating if token is blacklisted
 */
const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};
exports.isTokenBlacklisted = isTokenBlacklisted;
