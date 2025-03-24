import React from 'react'

const RenderAttachments = (file,url) => {
    switch(file){
        case "video":
            return (
                <video src={url} preload='none' controls className="w-full h-full object-cover" />
            )
        case "image":
            return (
                <img     
                src={transformImage(url, 200)}
                alt="Attachement"
                width={"200px"}
                height={"150px"}
                style={{
                  objectFit: "contain",
                }} />
            )
        case "audio":
            return (
                <audio src={url} controls preload='none'/>
            )
        case "pdf":
            return (
                <iframe src={url} title="pdf" preload='none' className="w-full h-full object-cover" />
            )
        case "doc":
            return (
                <iframe src={url} title="doc" preload='none' className="w-full h-full object-cover" />
            )
        case "ppt": 
            return (
                <iframe src={url} title="ppt" preload='none' className="w-full h-full object-cover" />
            )
        default:
          //return file
    }
}

export default RenderAttachments