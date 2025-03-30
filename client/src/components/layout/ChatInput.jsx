import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import chatService from '../../service/chatService';

const ChatInput = ({ chatId }) => {
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const queryClient = useQueryClient();

    // Mutation for sending a message
    const sendMessageMutation = useMutation({
        mutationFn: (messageData) => chatService.sendMessage(messageData),
        onSuccess: () => {
            queryClient.invalidateQueries(['messages', chatId]);
        }
    });

    // Mutation for sending attachments
    const sendAttachmentsMutation = useMutation({
        mutationFn: (data) => chatService.sendAttachments(data),
        onSuccess: (response) => {
            // Handle successful attachment upload
            console.log('Attachments uploaded successfully', response);
            queryClient.invalidateQueries(['messages', chatId]);
            setAttachments([]);
        }
    });

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...files]);
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!message.trim() && attachments.length === 0) return;

        try {
            setIsUploading(true);
            
            // If there are attachments, send them first
            if (attachments.length > 0) {
                const formData = new FormData();
                attachments.forEach(file => {
                    formData.append('files', file);
                });
                
                if (message.trim()) {
                    formData.append('message', message);
                }
                
                await sendAttachmentsMutation.mutateAsync({
                    chatId,
                    files: formData
                });
            } else if (message.trim()) {
                // If no attachments but has message text
                await sendMessageMutation.mutateAsync({
                    chatId,
                    content: message
                });
            }
            
            // Clear input fields after sending
            setMessage('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-4 border-t border-neutral-800">
            {/* Display selected attachments */}
            {attachments.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                        <div 
                            key={index} 
                            className="bg-neutral-700 text-white text-xs py-1 px-2 rounded-full flex items-center gap-1"
                        >
                            <span className="truncate max-w-[150px]">{file.name}</span>
                            <button 
                                onClick={() => removeAttachment(index)}
                                className="text-neutral-400 hover:text-white"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                {/* Attachment button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-neutral-400 hover:text-white"
                    disabled={isUploading}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                </button>
                
                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                    disabled={isUploading}
                />
                
                {/* Message input */}
                <input
                    type="text"
                    placeholder={isUploading ? "Uploading..." : "Type a message..."}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 bg-neutral-800 text-white rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={isUploading}
                />
                
                {/* Send button */}
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isUploading || (!message.trim() && attachments.length === 0)}
                >
                    {isUploading ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    )}
                </button>
            </form>
        </div>
    );
};

ChatInput.propTypes = {
    chatId: PropTypes.string.isRequired
};

export default ChatInput;
