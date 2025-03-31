import multer from "multer"
import path from "path"

// Create storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/")
    },
    filename: function (req, file, cb) {
        // Extract the original file name and extension
        const originalName = path.parse(file.originalname).name
        const extension = path.extname(file.originalname)
        
        // Add a small unique suffix to prevent filename collisions
        // Using a shorter timestamp to keep more of the original name visible
        const timestamp = Date.now().toString().slice(-6)
        cb(null, `${originalName}_${timestamp}${extension}`)
    }
})

// File filter to allow specific file types
const fileFilter = (req, file, cb) => {
    // Accept images, PDFs, documents, videos, and audio files
    const allowedFileTypes = [
        // Images
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        // Documents
        'application/pdf', 
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
        'text/plain',
        // Videos
        'video/mp4', 'video/webm', 'video/ogg',
        // Audio
        'audio/mpeg', 'audio/wav', 'audio/ogg'
    ]
    
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: ${allowedFileTypes.join(', ')}`), false)
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10 // 10MB
    },
    fileFilter: fileFilter
})

export const attachmentsMulter = upload.array("files", 5)
export default upload
