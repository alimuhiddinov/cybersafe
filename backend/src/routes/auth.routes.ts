import { Router } from 'express';
import { 
  register, 
  login, 
  logout,
  refreshToken,
  verifyEmail, 
  requestPasswordReset, 
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);
router.post('/profile/image', authenticate, uploadProfileImage);

// Test route to verify authentication
router.get('/verify-token', authenticate, (req, res) => {
  res.status(200).json({ message: 'Token is valid', user: req.user });
});

export default router;
