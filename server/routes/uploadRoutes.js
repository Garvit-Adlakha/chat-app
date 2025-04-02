import express from 'express';
import { getSignedUploadParams } from '../controllers/uploadController.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route to get signed upload parameters for direct Cloudinary uploads
router.post('/get-signed-params', isAuthenticated, getSignedUploadParams);

export default router;
