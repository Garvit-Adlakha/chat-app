import {Router} from 'express';
import { addMembers, deleteChat, getMyChats, getMyGroups, leaveGroup, newGroupChat, removeMembers } from '../controllers/chat.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router=Router();

router.post('/new',isAuthenticated,newGroupChat)
router.get('/getChat',isAuthenticated,getMyChats)
router.get('/getGroup',isAuthenticated,getMyGroups)

router.put('/addMembers',isAuthenticated,addMembers)
router.put('/removeMembers',isAuthenticated,removeMembers)
router.delete('/deleteChat',isAuthenticated,deleteChat)
router.delete('/leave/:id',isAuthenticated,leaveGroup)

export default router;