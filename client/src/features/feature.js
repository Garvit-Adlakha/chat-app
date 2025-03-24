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

const getOrSaveFromStorage = ({ key, value, get }) => {
    if (get)
      return localStorage.getItem(key)
        ? JSON.parse(localStorage.getItem(key))
        : null;
    else localStorage.setItem(key, JSON.stringify(value));
  };

  export {fileFormat,transformImage,getOrSaveFromStorage}
