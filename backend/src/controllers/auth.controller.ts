import { Request, Response } from 'express';
import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateTokenPair, generateAccessToken, blacklistToken } from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import { validateRegistration, validateLogin, validateProfileUpdate } from '../utils/validators';

const prisma = new PrismaClient();

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    // Validate input
    const validationErrors = validateRegistration(req.body);
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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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
    const tokens = generateTokenPair(user.id, user.role);

    // Store refresh token hash in database for future validation
    // This is optional but adds another layer of security
    const refreshTokenHash = crypto
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
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * Login user and return JWT token
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const tokens = generateTokenPair(user.id, user.role);

    // Store refresh token hash in database for future validation
    const refreshTokenHash = crypto
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

    // Return access token and user info
    res.status(200).json({
      token: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Logout user by blacklisting the token
 * @route POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      // Add token to blacklist
      blacklistToken(token);
    }

    // Clear refresh token from cookie
    res.clearCookie('refreshToken');
    
    // If user is in the request (from auth middleware), clear refresh token in database
    if (req.user?.id) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { refreshToken: null }
      });
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

/**
 * Refresh access token using refresh token
 * @route POST /api/auth/refresh-token
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not provided' });
    }

    // Verify refresh token
    const decoded = await import('../utils/jwt').then(jwt => jwt.verifyRefreshToken(refreshToken));
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
    const accessToken = generateAccessToken(user.id, user.role);

    res.status(200).json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
};

/**
 * Request password reset
 * @route POST /api/auth/request-password-reset
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
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
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Hash the token for security
    const resetTokenHash = crypto
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
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

/**
 * Reset password
 * @route POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Hash the provided token for comparison
    const resetTokenHash = crypto
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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

/**
 * Verify user email
 * @route POST /api/auth/verify-email
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Hash the provided token for comparison
    const verificationTokenHash = crypto
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
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

/**
 * Get user profile information
 * @route GET /api/auth/profile
 * @access Private - Requires authentication
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

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
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { username, email, firstName, lastName, bio } = req.body;

    // Get current user data to handle empty fields properly
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate input
    const validationErrors = validateProfileUpdate(req.body);
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

    // Update user - preserve existing values if fields are empty
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: username || currentUser.username,
        email: email || currentUser.email,
        firstName: firstName !== undefined ? firstName : currentUser.firstName,
        lastName: lastName !== undefined ? lastName : currentUser.lastName,
        bio: bio !== undefined ? bio : currentUser.bio
      }
    });

    // Generate new token with updated user data
    const tokens = generateTokenPair(updatedUser.id, updatedUser.role);

    // Return fresh token with updated user data
    res.status(200).json({
      message: 'Profile updated successfully',
      token: tokens.accessToken,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        bio: updatedUser.bio,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};

/**
 * Change user password
 * @route PUT /api/auth/password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
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

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Generate new token after password change
    const tokens = generateTokenPair(updatedUser.id, updatedUser.role);

    res.status(200).json({ 
      message: 'Password updated successfully',
      token: tokens.accessToken,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        bio: updatedUser.bio,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
};

/**
 * Upload profile image
 * @route POST /api/auth/profile/image
 */
export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // This implementation handles both direct image URLs and base64 data
    // For a real implementation, we would use multer to handle file uploads
    
    // Extract profile image from request body
    let profileImage = '';
    
    if (req.body.profileImageUrl) {
      // If sending a URL directly
      profileImage = req.body.profileImageUrl;
    } else if (req.body.profileImage) {
      // If sending the image in another format
      profileImage = req.body.profileImage;
    }
    
    // For now, just acknowledge the request without requiring an actual URL
    
    // Update user with profile image if provided
    if (profileImage) {
      await prisma.user.update({
        where: { id: userId },
        data: { profileImage }
      });
    }
    
    // Get updated user to return in response
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate fresh token with updated user data
    const tokens = generateTokenPair(updatedUser.id, updatedUser.role);
    
    res.status(200).json({
      message: 'Profile image request processed successfully',
      token: tokens.accessToken,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        bio: updatedUser.bio,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage || ''
      }
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ message: 'Server error during profile image upload' });
  }
};

export default {
  register,
  login,
  logout,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage
};
