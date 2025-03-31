import React from 'react'
import { transformImage } from '../../lib/feature'
import { IconFileHorizontalFilled } from '@tabler/icons-react'
// Add FileIcon component


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
                <audio src={url} controls preload='none' className="w-full" />
         )
        default:
          return (
            <div className="flex flex-col items-center p-6 bg-zinc-900 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-900/90 transition-colors">
              <IconFileHorizontalFilled />
              <span className="text-xs text-gray-500 mt-1">
            Document
              </span>
            </div>
          )
    }
}

export default RenderAttachments