import express from 'express';
import upload from '../utils/multer.js';
import {  loginUser, registerUser, signout,searchUser,sendFriendRequest, getAllNotifications, acceptFriendRequest, getMyFriends, getProfile, googleAuth } from '../controllers/user.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { validateSignin, validateSignup } from '../middlewares/validation.middleware.js';
const router = express.Router();

router.post('/signup',upload.single('avatar'),validateSignin,registerUser)
router.post('/signin',loginUser)
router.post('/google-auth', googleAuth)

router.get('/profile',isAuthenticated,getProfile)
router.get('/profile/:id',isAuthenticated,getProfile)
router.post('/signout',isAuthenticated,signout)

router.get('/search',isAuthenticated,searchUser)

router.put('/sendrequest',isAuthenticated,sendFriendRequest)

router.get('/notifications',isAuthenticated,getAllNotifications)

router.put('/acceptrequest',isAuthenticated,acceptFriendRequest)

router.get('/getfriends',isAuthenticated,getMyFriends)
export default router;