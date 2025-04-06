import express from 'express';
import upload from '../utils/multer.js';
import {
  loginUser, registerUser, signout, searchUser, sendFriendRequest, getAllNotifications,
  acceptFriendRequest, getMyFriends, getProfile, googleAuth, updateUser,
  removeFriends
} from '../controllers/user.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { 
  validateSignin, validateSignup, validateGoogleAuth, 
  validateForgotPassword, validatePasswordReset 
} from '../validations/auth.validation.js';

const router = express.Router();

// Security middleware for setting CORS and other security headers
const setCorsHeaders = (req, res, next) => {
  // Apply consistent Cross-Origin-Resource-Policy for all routes
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
};

// Apply the CORS headers middleware to all routes in this router
router.use(setCorsHeaders);

// Public authentication routes
router.post('/signup', upload.single('avatar'), registerUser);
router.post('/signin', loginUser);

// Google authentication
router.post('/google-auth', validateGoogleAuth, googleAuth);

// // Password reset routes
// router.post('/forgot-password', validateForgotPassword, forgotPassword);
// router.post('/reset-password', validatePasswordReset, resetPassword);

// Profile routes
router.get('/profile', isAuthenticated, getProfile);
router.get('/profile/:id', isAuthenticated, getProfile);
router.post('/signout', isAuthenticated, signout);

// User search and friend management
router.get('/search', isAuthenticated, searchUser);
router.put('/sendrequest', isAuthenticated, sendFriendRequest);
router.get('/notifications', isAuthenticated, getAllNotifications);
router.put('/acceptrequest', isAuthenticated, acceptFriendRequest);
router.get('/getfriends', isAuthenticated, getMyFriends);
router.delete('/removefriend/:friendId', isAuthenticated, removeFriends );

// Profile update
router.put('/update', isAuthenticated, upload.single('avatar'), updateUser);

export default router;