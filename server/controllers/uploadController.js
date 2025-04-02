import { generateSignedParams } from '../utils/cloudinary.js';
import path from 'path';

/**
 * Generate signed upload parameters for direct client-side uploads to Cloudinary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getSignedUploadParams = async (req, res) => {
    try {
        const { fileName, fileType } = req.body;
        
        if (!fileName || !fileType) {
            return res.status(400).json({ 
                success: false, 
                message: "File name and type are required" 
            });
        }
        
        // Extract file extension from fileName
        const fileExt = path.extname(fileName);
        
        // Generate signed parameters
        const signedParams = generateSignedParams({
            fileExt,
            folder: 'chat-app'
        });
        
        return res.status(200).json({
            success: true,
            data: signedParams
        });
    } catch (error) {
        console.error('Error generating signed upload params:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate upload parameters",
            error: error.message
        });
    }
};
