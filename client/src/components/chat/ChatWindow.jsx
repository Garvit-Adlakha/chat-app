import { ChatHeader } from "../layout/ChatHeader";
import { ChatMessage } from "../layout/ChatMessage";
import { MessageInput } from "../layout/MessageInput";
import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import chatService from "../../service/chatService";
import Loading from "../shared/Loading";
import { toast } from "react-hot-toast";
import { IconArrowNarrowDown } from "@tabler/icons-react";

const ChatWindow = ({ chatId }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [droppedFiles, setDroppedFiles] = useState(null);
    const dragCounter = useRef(0);
    const dragTimeoutRef = useRef(null);

    // Handle drag events with counter to prevent flickering
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Increment counter to track nested elements
        dragCounter.current++;
        
        // Clear any existing timeout
        if (dragTimeoutRef.current) {
            clearTimeout(dragTimeoutRef.current);
            dragTimeoutRef.current = null;
        }
        
        setIsDragging(true);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        // Just prevent default to allow drop, but don't toggle state here
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Decrement counter
        dragCounter.current--;
        
        // Only set isDragging to false if we've left all draggable areas
        if (dragCounter.current <= 0) {
            // Use timeout to prevent flickering
            dragTimeoutRef.current = setTimeout(() => {
                setIsDragging(false);
            }, 50);
            
            dragCounter.current = 0;
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Reset counter and drag state
        dragCounter.current = 0;
        setIsDragging(false);
        
        // Clear any existing timeout
        if (dragTimeoutRef.current) {
            clearTimeout(dragTimeoutRef.current);
            dragTimeoutRef.current = null;
        }
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setDroppedFiles(e.dataTransfer.files);
        }
    }, []);

    // Reset dropped files after they've been processed
    const resetDroppedFiles = useCallback(() => {
        setDroppedFiles(null);
    }, []);

    useEffect(() => {
        // Cleanup function
        return () => {
            setDroppedFiles(null);
            // Clear timeout to prevent memory leaks
            if (dragTimeoutRef.current) {
                clearTimeout(dragTimeoutRef.current);
            }
            dragCounter.current = 0;
        };
    }, [chatId]);

    const { data: chatData, isLoading, error } = useQuery({
        queryKey: ["chatData", chatId],
        queryFn: () => chatService.getChatDetails(chatId),
        enabled: !!chatId,
    });

    if(isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loading  />
            </div>
        );
    }
    return (
        <section 
            className={`
                chat-window h-full rounded-2xl bg-white/80
                dark:bg-neutral-900/95 backdrop-blur-xl shadow-2xl 
                flex flex-col relative overflow-hidden
                ${isDragging ? 'ring-2 ring-blue-500' : ''}
            `}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <ChatHeader chatId={chatId} />
            
            <div className="flex-1 overflow-y-auto">
                <ChatMessage chatId={chatId}/>
            </div>
            
            {isDragging && (
                <div className="absolute inset-0 bg-neutral-900/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-neutral-800 rounded-xl p-6 text-center shadow-lg border border-blue-500 animate-pulse">
                        <div className="text-3xl mb-2">📎</div>
                        <p className="text-white text-lg font-medium">
                            Drop files here
                            <div className="flex justify-center mt-2">
                                <IconArrowNarrowDown className="animate-bounce" size={24} />
                            </div>
                        </p>
                        <p className="text-neutral-400 text-sm">Files will be added to your message</p>
                    </div>
                </div>
            )}
            
            <MessageInput 
                chatId={chatId}
                members={chatData.members}
                droppedFiles={droppedFiles}
                resetDroppedFiles={resetDroppedFiles}
            />
        </section>
    );
};

// Create shared components for loading and error states


export default ChatWindow;