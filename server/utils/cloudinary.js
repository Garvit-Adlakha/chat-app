import {v2 as cloudinary} from 'cloudinary'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({})

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    secure: true,
})

export const uploadMedia = async(filePath) => {
    try {
        if (!filePath) {
            throw new Error("File path is required");
        }
        const result = await cloudinary.uploader.upload(filePath, {
            folder: "whisperwire",
            resource_type: "auto",
            use_filename: true,
            unique_filename: true,
            overwrite: true,
            // Avoid setting cookies
            cookies: false
        });
        return result;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
}

/**
 * Generate signed upload parameters for secure direct uploads
 * @param {Object} options - Options including file extension, folder, etc.
 * @returns {Object} Signed upload parameters for client-side upload
 */
export const generateSignedParams = (options = {}) => {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        
        // Determine resource type based on file extension
        let resourceType = "auto";
        if (options.fileExt) {
            const fileExt = options.fileExt.toLowerCase();
            if (fileExt === '.pdf') {
                resourceType = "raw";
            } else if (['.mp3', '.wav', '.ogg'].includes(fileExt)) {
                resourceType = "video";
            } else if (['.mp4', '.webm', '.mov'].includes(fileExt)) {
                resourceType = "video";
            }
        }
        
        // Create upload params
        const uploadParams = {
            timestamp,
            folder: options.folder || "chat-app",
            resource_type: resourceType
        };
        
        // Add format for PDFs
        if (options.fileExt === '.pdf') {
            uploadParams.format = 'pdf';
        }
        
        // Generate signature
        const signature = cloudinary.utils.api_sign_request(
            uploadParams, 
            process.env.CLOUDINARY_API_SECRET
        );
        
        return {
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            resourceType,
            folder: uploadParams.folder,
            format: uploadParams.format
        };
    } catch (error) {
        console.log("Error in :: generateSignedParams():", error);
        throw error;
    }
}

export const  deleteMediaFromCloudinary =async(publicId)=>{
    try {
        await cloudinary.uploader.destroy(publicId)
    } catch (error) {
        console.log("Error in :: deleteMediaFromCloudinary()",error)
        throw error;
    }
}

export const deleteVideoFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId,{resource_type:"video"});
    } catch (error) {
        console.log("Error in :: deleteVideoFromCloudinary()",error);
        throw error;
    }
}

export default cloudinary;
