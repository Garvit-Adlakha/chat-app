import { useState, useRef, useEffect, useCallback } from "react";
import { useClickOutside } from "../../hooks/UseClickOutside.js";
import { IconSend, IconPaperclip, IconMoodSmile } from '@tabler/icons-react';
import EmojiPicker from 'emoji-picker-react';
import { NEW_MESSAGE, TYPING, STOP_TYPING } from "../../constants/event.js";
import useSocketStore from "../socket/Socket.jsx";
import chatService from "../../service/chatService.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const MessageInput = ({chatId, members}) => {
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const emojiPickerRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const inputRef = useRef(null);
    
    const { socket } = useSocketStore();
    const queryClient = useQueryClient();
    
    // Fixed TypingHandler to properly handle typing notifications
    const TypingHandler = useCallback((data) => {
        if(data.chatId !== chatId) return;
        // Handle typing indication from other users
        // This could update a state showing which users are typing
        console.log(`User is typing in chat ${chatId}`);
    }, [chatId]);

    useEffect(() => {
        if(!socket) return;
        socket.on(TYPING, TypingHandler);
        return () => {
            socket.off(TYPING, TypingHandler);
        };
    }, [socket, TypingHandler]);

    // Handle input focus changes
    const handleInputFocus = () => {
        setInputFocused(true);
    };

    const handleInputBlur = () => {
        setInputFocused(false);
        
        // If user was typing and now input is blurred, stop typing indication
        if (isTyping && socket) {
            setIsTyping(false);
            socket.emit(STOP_TYPING, { members, chatId });
        }
    };

    // Debounced typing indicator - only emit when input is focused
    const sendTypingIndicator = useCallback(() => {
        if (!socket || !inputFocused) return;
        
        // Only emit if not already marked as typing
        if (!isTyping) {
            setIsTyping(true);
            socket.emit(TYPING, { members, chatId });
        }
        
        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Set typing to false after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            if (isTyping) {
                setIsTyping(false);
                socket.emit(STOP_TYPING, { members, chatId });
            }
        }, 2000);
    }, [socket, chatId, members, isTyping, inputFocused]);

    // Cleanup typing timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            // Ensure typing status is cleared when component unmounts
            if (socket && isTyping) {
                socket.emit(STOP_TYPING, { members, chatId });
            }
        };
    }, [socket, isTyping, members, chatId]);
    
    // File upload mutation
    const uploadMutation = useMutation({
        mutationFn: (formData) => chatService.sendAttachments({
            chatId,
            files: formData
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['messages', chatId]);
        }
    });
    
    const onMessageChangeHanndler = (e) => {
        setMessage(e.target.value);
        sendTypingIndicator();
    }
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!message.trim()) return;
      
      const messageContent = message.trim();
      setMessage(''); // Clear input immediately for better UX
      
      // Stop typing indicator after sending message
      if (isTyping) {
        setIsTyping(false);
        socket.emit(STOP_TYPING, { members, chatId });
      }
      
      socket.emit(NEW_MESSAGE, {
          chatId, 
          members, 
          message: messageContent
      });
    };

    const handleFileSelect = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      setIsUploading(true);
      
      try {
        // Create FormData and append the file
        const formData = new FormData();
        formData.append('files', file);
        formData.append('chatId', chatId);
        
        // Upload the file
        await uploadMutation.mutateAsync(formData);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsUploading(false);
      }
    };

    const onEmojiClick = (emojiObject) => {
      setMessage((prevMsg) => prevMsg + emojiObject.emoji);
      // Focus back on input after emoji selection
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
  
    useClickOutside(emojiPickerRef, () => setShowEmojiPicker(false));
  
    return (
      <footer className="p-4 bg-neutral-800/90 backdrop-blur-xl border-t border-neutral-700 z-10">
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <label className={`p-2 ${isUploading ? 'text-blue-500 animate-pulse' : 'text-neutral-400 hover:bg-neutral-700'} rounded-full transition-colors cursor-pointer`}>
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileSelect}
              ref={fileInputRef}
              disabled={isUploading}
            />
            <IconPaperclip className="w-5 h-5" />
          </label>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={onMessageChangeHanndler}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={isUploading ? "Uploading..." : "Type a message"}
              className="w-full px-4 py-2 bg-neutral-700/50 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-neutral-400"
              disabled={isUploading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 hover:bg-neutral-600 rounded-full transition-colors"
                disabled={isUploading}
              >
                <IconMoodSmile className="w-5 h-5 text-neutral-400" />
              </button>
              
              {showEmojiPicker && (
                <div 
                  ref={emojiPickerRef}
                  className="absolute bottom-12 right-0 z-50"
                >
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    theme="dark"
                    width={320}
                    height={400}
                  />
                </div>
              )}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!message.trim() || isUploading}
            className={`p-2 rounded-full transition-colors ${
              message.trim() && !isUploading
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-neutral-700 text-neutral-400'
            }`}
          >
            {isUploading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <IconSend className="w-5 h-5" />
            )}
          </button>
        </form>
      </footer>
    );
};

export default MessageInput;