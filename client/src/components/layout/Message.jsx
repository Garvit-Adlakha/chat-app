import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import moment from 'moment';
import { IconX } from '@tabler/icons-react';
import { fileFormat, transformImage } from '../../lib/feature';
import  RenderAttachments  from '../shared/RenderAttachments';

const Message = memo(({ message, isSender }) => {
    const [previewImage, setPreviewImage] = useState(null);
    const timeAgo = moment(message.createdAt).fromNow();

    const openImagePreview = (url) => {
        setPreviewImage(url);
    };

    const closeImagePreview = () => {
        setPreviewImage(null);
    };

    return (
        <>
            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                    onClick={closeImagePreview}
                >
                    <div className="max-w-2xl max-h-[80vh] overflow-auto p-2">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                    <button
                        className="absolute top-4 right-4 text-white bg-neutral-800 hover:bg-neutral-700 transition-colors rounded-full p-2 shadow-lg"
                        onClick={closeImagePreview}
                    >
                        <IconX size={24} />
                    </button>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`chat ${isSender ? 'chat-end' : 'chat-start'} group`}
            >
                <div className="chat-header text-neutral-400 text-xs flex items-center gap-2 mb-1">
                    {!isSender && (
                        <span className="font-medium text-neutral-300">
                            {message.sender.name}
                        </span>
                    )}
                    <time
                        className="opacity-60"
                        dateTime={message.createdAt}
                        title={new Date(message.createdAt).toLocaleString()}
                    >
                        {timeAgo}
                    </time>
                </div>
                <div
                    className={`chat-bubble ${isSender
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md'
                            : 'bg-gradient-to-br from-neutral-700 to-neutral-800 text-white shadow-md'
                        } max-w-md break-words rounded-2xl px-4 py-3 transition-all duration-200 hover:shadow-lg ${isSender ? 'hover:from-blue-500 hover:to-blue-600' : 'hover:from-neutral-600 hover:to-neutral-700'
                        }`}
                >
                    {message.content && <div className="leading-relaxed">{message.content}</div>}

                    {message.attachments && message.attachments.length > 0 && (
                        <div className="">
                            {message.attachments.map((attachment, index) => {
                                const url = attachment.url;
                                const fileType = fileFormat(url);

                                return (
                                    <div key={index} className="overflow-hidden rounded-lg bg-black/20 backdrop-blur-sm  transition-transform hover:scale-[1.02]">
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={url}
                                            onClick={(e) => {
                                                if (fileType === "image") {
                                                    e.preventDefault();
                                                    openImagePreview(url);
                                                } else if (fileType === "audio") {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }
                                            }}
                                            className={`block ${fileType === "audio" ? "no-underline " : ""}`}
                                        >
                                            {RenderAttachments(fileType, url)}
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="chat-footer opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                    {message.readBy && message.readBy.length > 0 && (
                        <span className="text-blue-400 px-2 py-1 bg-neutral-800/50 backdrop-blur-sm rounded-full">
                            Seen
                        </span>
                    )}
                </div>
            </motion.div>
        </>
    );
});

export default Message;