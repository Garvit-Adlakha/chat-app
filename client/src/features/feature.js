const fileFormat=(url="")=>{
    const fileExtension=url.split('.').pop()
    if(fileExtension==="mp4" || fileExtension==="webm" || fileExtension==="ogg"){
        return "video"
    }
    if(fileExtension==="jpg" || fileExtension==="jpeg" || fileExtension==="png" || fileExtension==="gif"){
        return "image"
    }
    if(fileExtension==="mp3" || fileExtension==="wav" || fileExtension==="ogg"){
        return "audio"
    }
    if(fileExtension==="pdf"){
        return "pdf"
    }
    if(fileExtension==="doc" || fileExtension==="docx"){
        return "doc"
    }
    if(fileExtension==="ppt" || fileExtension==="pptx"){
        return "ppt"
    }
    return "file"
}

const transformImage=(url)=>{
    const newUrl=url.replace("upload/",`upload/dpr_auto/w_${width}/`)
    return newUrl
}

/**
 * Uploads a file directly to Cloudinary using signed parameters
 * @param {File} file - The file to upload
 * @param {Object} signedParams - Signed parameters from server
 * @returns {Promise<Object>} Upload response from Cloudinary
 */
const directCloudinaryUpload = async (file, signedParams) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signedParams.apiKey);
        formData.append('timestamp', signedParams.timestamp);
        formData.append('signature', signedParams.signature);
        formData.append('folder', signedParams.folder);
        
        if (signedParams.format) {
            formData.append('format', signedParams.format);
        }
        
        const uploadUrl = `https://api.cloudinary.com/v1_1/${signedParams.cloudName}/${signedParams.resourceType}/upload`;
        
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            throw new Error(`Upload failed with status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error in direct Cloudinary upload:', error);
        throw error;
    }
};

const getOrSaveFromStorage = ({ key, value, get }) => {
    if (get)
      return localStorage.getItem(key)
        ? JSON.parse(localStorage.getItem(key))
        : null;
    else localStorage.setItem(key, JSON.stringify(value));
  };

  export {fileFormat, transformImage, getOrSaveFromStorage, directCloudinaryUpload}

 export const formatLastActive = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const lastActiveDate = new Date(date);
    const diffMs = now - lastActiveDate;
    
    // Less than a minute
    if (diffMs < 60000) return 'Just now';
    
    // Less than an hour
    if (diffMs < 3600000) {
        const mins = Math.floor(diffMs / 60000);
        return `${mins} min${mins > 1 ? 's' : ''} ago`;
    }
    
    // Less than a day
    if (diffMs < 86400000) {
        const hours = Math.floor(diffMs / 3600000);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Format date
    return lastActiveDate.toLocaleDateString();
};
