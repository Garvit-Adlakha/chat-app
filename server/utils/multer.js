import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Fix MIME type checking by including audio/mpeg explicitly
const fileFilter = (req, file, cb) => {
    // Log the file info for debugging
    console.log('File upload info:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        fieldname: file.fieldname
    });

    // Accept audio files explicitly - this fixes MP3 issues
    if (file.mimetype === 'audio/mpeg' || 
        file.mimetype === 'audio/mp3' ||
        file.mimetype.startsWith('image/') ||
        file.mimetype.startsWith('video/') ||
        file.mimetype === 'application/pdf' ||
        file.mimetype.includes('document') ||
        file.mimetype.includes('sheet') ||
        file.mimetype.includes('presentation')) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5
    },
    fileFilter: fileFilter
});

export const attachmentsMulter = upload.array("files", 5);
export default upload;
