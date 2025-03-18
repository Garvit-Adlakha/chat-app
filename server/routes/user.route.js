import express from 'express';
import upload from '../utils/multer.js';
import { getMyProfile, loginUser, registerUser, signout } from '../controllers/user.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
const router = express.Router();

router.post('/signup',upload.single('avatar'),registerUser)
router.post('/signin',loginUser)

router.get('/profile',isAuthenticated,getMyProfile)

router.get('/signout',isAuthenticated,signout)

export default router;