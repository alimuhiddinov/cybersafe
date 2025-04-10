"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfileImage = exports.changePassword = exports.updateProfile = exports.getProfile = exports.verifyEmail = exports.resetPassword = exports.requestPasswordReset = exports.refreshToken = exports.logout = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jwt_1 = require("../utils/jwt");
const emailService_1 = require("../services/emailService");
const validators_1 = require("../utils/validators");
const prisma = new client_1.PrismaClient();
/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        // Validate input
        const validationErrors = (0, validators_1.validateRegistration)(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
        }
        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });
        if (existingUser) {
            return res.status(400).json({
                message: existingUser.email === email
                    ? 'Email already in use'
                    : 'Username already taken'
            });
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                role: 'USER',
            }
        });
        // Generate tokens
        const tokens = (0, jwt_1.generateTokenPair)(user.id, user.role);
        // Store refresh token hash in database for future validation
        // This is optional but adds another layer of security
        const refreshTokenHash = crypto_1.default
            .createHash('sha256')
            .update(tokens.refreshToken)
            .digest('hex');
        await prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken: refreshTokenHash,
                lastLogin: new Date()
            }
        });
        // Set cookie with refresh token (httpOnly for security)
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'strict'
        });
        res.status(201).json({
            message: 'User registered successfully.',
            accessToken: tokens.accessToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};
exports.register = register;
/**
 * Login user
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        const validationErrors = (0, validators_1.validateLogin)(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
        }
        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Check password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Generate tokens
        const tokens = (0, jwt_1.generateTokenPair)(user.id, user.role);
        // Store refresh token hash in database for future validation
        const refreshTokenHash = crypto_1.default
            .createHash('sha256')
            .update(tokens.refreshToken)
            .digest('hex');
        await prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken: refreshTokenHash,
                lastLogin: new Date()
            }
        });
        // Set cookie with refresh token (httpOnly for security)
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'strict'
        });
        res.status(200).json({
            token: tokens.accessToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};
exports.login = login;
/**
 * Logout user by blacklisting the token
 * @route POST /api/auth/logout
 */
const logout = async (req, res) => {
    var _a;
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            // Add token to blacklist
            (0, jwt_1.blacklistToken)(token);
        }
        // Clear refresh token from cookie
        res.clearCookie('refreshToken');
        // If user is in the request (from auth middleware), clear refresh token in database
        if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) {
            await prisma.user.update({
                where: { id: req.user.id },
                data: { refreshToken: null }
            });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error during logout' });
    }
};
exports.logout = logout;
/**
 * Refresh access token using refresh token
 * @route POST /api/auth/refresh-token
 */
const refreshToken = async (req, res) => {
    try {
        // Get refresh token from cookies
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token not provided' });
        }
        // Verify refresh token
        const decoded = await Promise.resolve().then(() => __importStar(require('../utils/jwt'))).then(jwt => jwt.verifyRefreshToken(refreshToken));
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }
        // Verify if the token exists in the database
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }
        // Generate new access token
        const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
        res.status(200).json({
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ message: 'Server error during token refresh' });
    }
};
exports.refreshToken = refreshToken;
/**
 * Request password reset
 * @route POST /api/auth/request-password-reset
 */
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            // For security reasons, still return success even if email doesn't exist
            return res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link' });
        }
        // Generate reset token and expiry
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        // Hash the token for security
        const resetTokenHash = crypto_1.default
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        // Store reset token in user record
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: resetTokenHash,
                resetTokenExpiry
            }
        });
        // Send password reset email
        await (0, emailService_1.sendPasswordResetEmail)(email, resetToken);
        res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link' });
    }
    catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: 'Server error during password reset request' });
    }
};
exports.requestPasswordReset = requestPasswordReset;
/**
 * Reset password
 * @route POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ message: 'Token and password are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        // Hash the provided token for comparison
        const resetTokenHash = crypto_1.default
            .createHash('sha256')
            .update(token)
            .digest('hex');
        // Find user with matching reset token that hasn't expired
        const user = await prisma.user.findFirst({
            where: {
                resetToken: resetTokenHash,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        // Hash new password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Update user password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
        res.status(200).json({ message: 'Password reset successfully' });
    }
    catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
};
exports.resetPassword = resetPassword;
/**
 * Verify user email
 * @route POST /api/auth/verify-email
 */
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Verification token is required' });
        }
        // Hash the provided token for comparison
        const verificationTokenHash = crypto_1.default
            .createHash('sha256')
            .update(token)
            .digest('hex');
        // Find user with matching verification token
        const user = await prisma.user.findFirst({
            where: {
                verificationToken: verificationTokenHash,
                verificationExpiry: {
                    gt: new Date()
                }
            }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }
        // Update user verification status
        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
                verificationExpiry: null
            }
        });
        res.status(200).json({ message: 'Email verified successfully' });
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'Server error during email verification' });
    }
};
exports.verifyEmail = verifyEmail;
/**
 * Get user profile information
 * @route GET /api/auth/profile
 * @access Private - Requires authentication
 */
const getProfile = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                bio: true,
                role: true,
                profileImage: true,
                isPremium: true,
                premiumExpiryDate: true,
                isVerified: true,
                lastLogin: true,
                createdAt: true,
                // Exclude sensitive fields like password hash, tokens, etc.
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getProfile = getProfile;
/**
 * Update user profile
 * @route PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { username, email, firstName, lastName, bio } = req.body;
        // Validate input
        const validationErrors = (0, validators_1.validateProfileUpdate)(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
        }
        // Check if email or username is already taken
        if (email || username) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        email ? { email, NOT: { id: userId } } : {},
                        username ? { username, NOT: { id: userId } } : {}
                    ]
                }
            });
            if (existingUser) {
                return res.status(400).json({
                    message: existingUser.email === email
                        ? 'Email already in use'
                        : 'Username already taken'
                });
            }
        }
        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(username && { username }),
                ...(email && { email }),
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(bio && { bio })
            }
        });
        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                bio: updatedUser.bio
            }
        });
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error during profile update' });
    }
};
exports.updateProfile = updateProfile;
/**
 * Change user password
 * @route PUT /api/auth/password
 */
const changePassword = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { currentPassword, newPassword } = req.body;
        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: [
                    !currentPassword ? { field: 'currentPassword', message: 'Current password is required' } : null,
                    !newPassword ? { field: 'newPassword', message: 'New password is required' } : null
                ].filter(Boolean)
            });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: [{ field: 'newPassword', message: 'Password must be at least 8 characters' }]
            });
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: [{ field: 'newPassword', message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' }]
            });
        }
        // Verify current password
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        // Hash new password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'Server error during password change' });
    }
};
exports.changePassword = changePassword;
/**
 * Upload profile image
 * @route POST /api/auth/profile/image
 */
const uploadProfileImage = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // This is just a placeholder implementation since we don't have file upload middleware set up
        // In a real implementation, you would use multer or similar middleware to handle file uploads
        // and store the file path or URL in the database
        // For now, we'll just update a profile image URL if it's provided in the request
        const { profileImageUrl } = req.body;
        if (!profileImageUrl) {
            return res.status(400).json({ message: 'Profile image URL is required' });
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { profileImage: profileImageUrl }
        });
        res.status(200).json({
            message: 'Profile image updated successfully',
            profileImage: updatedUser.profileImage
        });
    }
    catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({ message: 'Server error during profile image upload' });
    }
};
exports.uploadProfileImage = uploadProfileImage;
exports.default = {
    register: exports.register,
    login: exports.login,
    logout: exports.logout,
    refreshToken: exports.refreshToken,
    requestPasswordReset: exports.requestPasswordReset,
    resetPassword: exports.resetPassword,
    verifyEmail: exports.verifyEmail,
    getProfile: exports.getProfile,
    updateProfile: exports.updateProfile,
    changePassword: exports.changePassword,
    uploadProfileImage: exports.uploadProfileImage
};
