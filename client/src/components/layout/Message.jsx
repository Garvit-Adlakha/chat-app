import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import moment from 'moment';
import { IconX } from '@tabler/icons-react';
import { fileFormat, transformImage } from '../../lib/feature';
import RenderAttachments from '../shared/RenderAttachments';

const Message = memo(({ message, isSender }) => {
    const [previewImage, setPreviewImage] = useState(null);
    const timeAgo = moment(message.createdAt).fromNow();

    const openImagePreview = (url) => {
        setPreviewImage(url);
    };

    const closeImagePreview = () => {
        setPreviewImage(null);
    };

    const handlePdfOpen = (url) => {
        // For PDFs specifically, force a download instead of trying to open in browser
        const link = document.createElement('a');
        link.href = url;
        link.download = url.split('/').pop(); // Extract filename from URL
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                className={`chat ${isSender ? 'chat-end' : 'chat-start'}`}
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
                        } max-w-md break-words rounded-2xl px-4 py-3`}
                >
                    {message.content && <div className="leading-relaxed">{message.content}</div>}

                    {message.attachments && message.attachments.length > 0 && (
                        <div className="space-y-2">
                            {message.attachments.map((attachment, index) => {
                                const url = attachment.url;
                                const fileType = fileFormat(url);

                                return (
                                    <div 
                                        key={index} 
                                        className="rounded-lg backdrop-blur-sm"
                                    >
                                        {fileType === "pdf" ? (
                                            <div onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handlePdfOpen(url);
                                            }}>
                                                {RenderAttachments(fileType, url)}
                                            </div>
                                        ) : (
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={fileType !== "image"}
                                                onClick={(e) => {
                                                    if (fileType === "image") {
                                                        e.preventDefault();
                                                        openImagePreview(url);
                                                    } else if (fileType === "audio") {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }
                                                }}
                                                className={fileType === "audio" ? "no-underline" : ""}
                                            >
                                                {RenderAttachments(fileType, url)}
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="chat-footer text-xs">
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