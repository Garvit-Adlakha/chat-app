import {Router} from 'express';
import { addMembers, getMyChats, getMyGroups, newGroupChat } from '../controllers/chat.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router=Router();

router.post('/new',isAuthenticated,newGroupChat)
router.get('/getChat',isAuthenticated,getMyChats)
router.get('/getGroup',isAuthenticated,getMyGroups)

router.put('/addMembers',isAuthenticated,addMembers)
export default router;