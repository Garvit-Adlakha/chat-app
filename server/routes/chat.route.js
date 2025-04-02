import {Router} from 'express';
import { addMembers, deleteChat, getChatDetails, getMessages, getMyChats, getMyGroups, leaveGroup, newGroupChat, removeMembers, renameGroup, sendAttachments, sendDirectMessage } from '../controllers/chat.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import upload, { attachmentsMulter } from '../utils/multer.js';

const router=Router();

router.post('/new',isAuthenticated, upload.single('groupIcon'),newGroupChat)
router.get('/getChat',isAuthenticated,getMyChats)
router.get('/getGroup',isAuthenticated,getMyGroups)

router.put('/addMembers',isAuthenticated,addMembers)
router.put('/removeMembers',isAuthenticated,removeMembers)
router.delete('/leave/:id',isAuthenticated,leaveGroup)

router.post('/message',isAuthenticated,attachmentsMulter,sendAttachments)
router.get('/message/:id',isAuthenticated,getMessages)

// Add new route for direct message with Cloudinary attachments
router.post('/direct-message', isAuthenticated, sendDirectMessage)

//Get chat Details,rename,delete

router.get('/:id',getChatDetails)
router.put('/:id',isAuthenticated,renameGroup)
router.delete('/:id',isAuthenticated,deleteChat)
export default router;