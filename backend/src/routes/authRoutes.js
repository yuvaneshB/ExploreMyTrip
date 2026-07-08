import express from 'express';
import {
  register,
  login,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleAuth,
  getProfile,
  updateProfile,
  changePassword,
  getActivityLogs,
  subscribeNewsletter
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/verify-otp', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google-auth', googleAuth);

// Protected endpoints
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/logs', protect, getActivityLogs);
router.post('/newsletter/subscribe', protect, subscribeNewsletter);

export default router;
