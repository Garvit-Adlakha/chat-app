import express from 'express';
import upload from '../utils/multer.js';
import { getMyProfile, loginUser, registerUser, signout,searchUser,sendFriendRequest, getAllNotifications, acceptFriendRequest } from '../controllers/user.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { validateSignin, validateSignup } from '../middlewares/validation.middleware.js';
const router = express.Router();

router.post('/signup',upload.single('avatar'),validateSignin,registerUser)
router.post('/signin',loginUser)

router.get('/profile',isAuthenticated,getMyProfile)

router.get('/signout',isAuthenticated,signout)

router.get('/search',isAuthenticated,searchUser)

router.put('/sendrequest',isAuthenticated,sendFriendRequest)

router.get('/notifications',isAuthenticated,getAllNotifications)

router.put('/acceptrequest',isAuthenticated,acceptFriendRequest)
export default router;