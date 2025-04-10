"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = exports.authorizeUser = exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Authentication middleware that verifies JWT tokens
 * Attaches the user payload to the request if authenticated
 */
const authenticate = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Authentication failed: No Bearer token provided');
            return res.status(401).json({ message: 'Authentication required' });
        }
        // Extract token
        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('Authentication failed: Empty token');
            return res.status(401).json({ message: 'Invalid token format' });
        }
        console.log('Attempting to verify token:', token.substring(0, 15) + '...');
        // Verify token
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (!decoded) {
            console.log('Authentication failed: Token verification returned null');
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        console.log('Token verified successfully for user ID:', decoded.id);
        // Attach user to request
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ message: 'Authentication failed' });
    }
};
exports.authenticate = authenticate;
/**
 * Role-based authorization middleware
 * Requires the authenticate middleware to be called first
 * @param roles Array of allowed roles
 */
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (!req.user.role || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        next();
    };
};
exports.authorize = authorize;
/**
 * Middleware to check if the requested user ID matches the authenticated user
 * or if the user has admin role
 */
const authorizeUser = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        // Get requested user ID from params or body
        const requestedUserId = parseInt(req.params.id || req.body.userId, 10);
        // If no specific user ID is being accessed or it matches the authenticated user, allow
        if (!requestedUserId || req.user.id === requestedUserId) {
            return next();
        }
        // Check if user has admin role
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if ((user === null || user === void 0 ? void 0 : user.role) === 'ADMIN') {
            return next();
        }
        return res.status(403).json({ message: 'You do not have permission to access this resource' });
    }
    catch (error) {
        console.error('Authorization error:', error);
        return res.status(500).json({ message: 'Server error during authorization' });
    }
};
exports.authorizeUser = authorizeUser;
/**
 * Rate limiting middleware to prevent brute force attacks
 * Simple implementation - in production use a more robust solution like express-rate-limit
 */
const requestCounts = new Map();
const rateLimit = (maxRequests = 10, windowMs = 60 * 1000 // 1 minute
) => {
    return (req, res, next) => {
        // Get client IP
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        // Get or initialize request count for this IP
        const requestData = requestCounts.get(ip) || { count: 0, resetTime: now + windowMs };
        // If window has expired, reset
        if (now > requestData.resetTime) {
            requestData.count = 1;
            requestData.resetTime = now + windowMs;
        }
        else {
            requestData.count++;
        }
        requestCounts.set(ip, requestData);
        // Check if rate limit exceeded
        if (requestData.count > maxRequests) {
            return res.status(429).json({
                message: 'Too many requests, please try again later',
                retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
            });
        }
        next();
    };
};
exports.rateLimit = rateLimit;
