import {Router} from 'express';
import { addMembers, deleteChat, getChatDetails, getMessages, getMyChats, getMyGroups, leaveGroup, newGroupChat, removeMembers, renameGroup, sendAttachments } from '../controllers/chat.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import upload, { attachmentsMulter } from '../utils/multer.js';
import { get } from 'mongoose';

const router=Router();

router.post('/new',isAuthenticated, upload.single('groupIcon'),newGroupChat)
router.get('/getChat',isAuthenticated,getMyChats)
router.get('/getGroup',isAuthenticated,getMyGroups)

router.put('/addMembers',isAuthenticated,addMembers)
router.put('/removeMembers',isAuthenticated,removeMembers)
router.delete('/leave/:id',isAuthenticated,leaveGroup)

router.post('/message',isAuthenticated,attachmentsMulter,sendAttachments)
router.get('/message/:id',isAuthenticated,getMessages)

//Get chat Details,rename,delete

router.get('/:id',getChatDetails)
router.put('/:id',isAuthenticated,renameGroup)
router.delete('/:id',isAuthenticated,deleteChat)
export default router;