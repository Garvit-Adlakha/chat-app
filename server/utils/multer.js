import multer from "multer"
const upload=multer({
    limits:{
        fileSize:1024*1024*5
    },
    //private files
    dest:"uploads/"
})

export default upload
