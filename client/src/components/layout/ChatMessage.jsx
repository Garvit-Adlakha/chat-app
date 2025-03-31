import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import chatService from '../../service/chatService';
import PropTypes from 'prop-types';
import { useRef, useEffect, useState, useMemo, useCallback, memo } from 'react';
import useSocketStore from '../socket/Socket';
import { NEW_MESSAGE, TYPING, STOP_TYPING } from '../../constants/event';
import { motion } from 'framer-motion';
import moment from 'moment';
import { fileFormat, transformImage } from '../../lib/feature';
import RenderAttachments from '../shared/RenderAttachments';
import { IconX } from '@tabler/icons-react';
import useChatStore from '../../store/chatStore';

const Message = memo(({ message, isSender }) => {
    const [previewImage, setPreviewImage] = useState(null);
    const timeAgo = moment(message.createdAt).fromNow();

    // Enhanced function to get a readable filename from Cloudinary URLs or publicId
  
    
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
                            className="max-w-full max-h-full object-contain" 
                        />
                    </div>
                    <button 
                        className="absolute top-4 right-4 text-white bg-neutral-800 rounded-full p-2"
                        onClick={closeImagePreview}
                    >
                        <IconX size={24} />
                    </button>
                </div>
            )}
            
            <motion.div 
                initial={{ opacity: 0, x: isSender ? "100%" : "-100%" }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`chat ${isSender ? 'chat-end' : 'chat-start'}`}
            >
                <div className="chat-header text-neutral-400 text-xs">
                    {!isSender && message.sender.name}
                    <time 
                        className="ml-2 opacity-50" 
                        dateTime={message.createdAt}
                        title={new Date(message.createdAt).toLocaleString()}
                    >
                        {timeAgo}
                    </time>
                </div>
                <div 
                    className={`chat-bubble ${
                        isSender 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-neutral-700 text-white'
                    } max-w-md break-words`}
                >
                    {message.content && <div>{message.content}</div>}
                    
                    {message.attachments && message.attachments.length > 0 && (
                        <div className="grid gap-2">
                            {message.attachments.map((attachment, index) => {
                                const url = attachment.url;
                                const fileType = fileFormat(url);
                                
                                return (
                                    <div key={index} className="">
                                        <a 
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={url}
                                            onClick={(e) => {
                                                if (fileType === "image") {
                                                    e.preventDefault();
                                                    openImagePreview(url);
                                                }
                                            }}
                                            className="block"
                                        >
                                            {RenderAttachments(fileType, url)}
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="chat-footer opacity-50 text-xs">
                    {message.readBy && message.readBy.length > 0 && (
                        <span className="text-blue-400">
                            Seen
                        </span>
                    )}
                </div>
            </motion.div>
        </>
    );
});

const TypingIndicator = ({ username }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="chat chat-start"
    >
        <div className="chat-bubble bg-neutral-700/50 backdrop-blur-sm flex items-center gap-2 min-h-0 py-3">
            <div className="flex space-x-1">
                <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.25 }}
                    className="w-2 h-2 rounded-full bg-white"
                />
                <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.25, delay: 0.15 }}
                    className="w-2 h-2 rounded-full bg-white"
                />
                <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.25, delay: 0.3 }}
                    className="w-2 h-2 rounded-full bg-white"
                />
            </div>
        </div>
    </motion.div>
);

export const ChatMessage = ({chatId}) => {
    const messagesEndRef = useRef(null);
    const observerTarget = useRef(null);
    const containerRef = useRef(null);
    const [firstLoad, setFirstLoad] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [prevScrollHeight, setPrevScrollHeight] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const queryClient = useQueryClient();
    const{data:currentUser}=useQuery({
        queryKey:["user"],
        queryFn:()=>chatService.getCurrentUser()
    })
    const {socket,connect,disconnect}=useSocketStore()
    const { typingUsers, setUserTyping, removeUserTyping } = useChatStore();
    
    const currentUserId=currentUser._id
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error
    } = useInfiniteQuery({
        queryKey: ['messages', chatId],
        queryFn: ({ pageParam = 1 }) => chatService.getMessage({
            chatId,
            page: pageParam
        }),
        getNextPageParam: (lastPage) => {
            if (Number(lastPage.currentPage) < Number(lastPage.total)) {
                return Number(lastPage.currentPage) + 1;
            }
            return undefined;
        },
        initialPageParam: 1
    });
 
    // Debounced fetch to prevent multiple rapid fetches
    const debouncedFetch = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && !isFetchingMore) {
            // Record the current scroll position before loading more
            if (containerRef.current) {
                setPrevScrollHeight(containerRef.current.scrollHeight);
                
                setIsFetchingMore(true);
                fetchNextPage()
                    .then(() => {
                        // After fetching, simply scroll down by a fixed amount
                        requestAnimationFrame(() => {
                            if (containerRef.current) {
                                // Simple fixed scroll - moves down 300px to reveal new content
                                containerRef.current.scrollTop = 300;
                            }
                        });
                    })
                    .catch(err => {
                        console.error("Error fetching next page:", err);
                    })
                    .finally(() => {
                        setTimeout(() => setIsFetchingMore(false), 800); // Delay to prevent rapid fetches
                    });
            }
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, isFetchingMore]);

    // Track when new pages are loaded
    useEffect(() => {
        if (data?.pages) {
            const newPageCount = data.pages.length;
            if (newPageCount > pageCount) {
                setPageCount(newPageCount);
            }
        }
    }, [data?.pages, pageCount]);

    // Use Intersection Observer for loading older messages
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !isFetchingMore) {
                    // Only fetch if we're not currently in a fetch operation
                    // and user has scrolled to the top area
                    if (containerRef.current && containerRef.current.scrollTop < 100) {
                        debouncedFetch();
                    }
                }
            },
            { threshold: 0.1, rootMargin: "50px 0px 0px 0px" } // Reduced margin to be less aggressive
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [debouncedFetch, isFetchingMore]);

    // Scroll to bottom function
    const scrollToBottom = (behavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    // Initial scroll to bottom
    useEffect(() => {
        if (data && firstLoad && !isLoading) {
            scrollToBottom("auto");
            setFirstLoad(false);
        }
    }, [data, isLoading, firstLoad]);

    // Process messages in reverse order
    const processedMessages = useMemo(() => {
        if (!data?.pages) return [];
        
        const allMessages = data.pages.flatMap(page => page.messages);
        
        return [...allMessages].sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
        );
    }, [data?.pages]);

    // Handle new messages via socket
    useEffect(() => {
        if (socket) {
            socket.on(NEW_MESSAGE, ({chatId: receivedChatId, message}) => {
                if (chatId === receivedChatId) {
                    queryClient.setQueryData(['messages', chatId], (oldData) => {
                        if (!oldData) return oldData;

                        // Check if the message already exists in any page
                        const messageExists = oldData.pages.some(page => 
                            page.messages.some(msg => msg._id === message._id)
                        );
                        
                        // Only add the message if it doesn't already exist
                        if (!messageExists) {
                            const newPages = [...oldData.pages];
                            const firstPageIndex = 0;
                            newPages[firstPageIndex] = {
                                ...newPages[firstPageIndex],
                                messages: [message, ...newPages[firstPageIndex].messages]
                            };
                            return {
                                ...oldData,
                                pages: newPages
                            };
                        }
                        return oldData;
                    });
                    scrollToBottom();
                }
            });
        }
        return () => {
            if (socket) {
                socket.off(NEW_MESSAGE);
            }
        };
    }, [socket, chatId, queryClient]);

    // Extract typing users for current chat
    const currentChatTypers = useMemo(() => {
        return typingUsers[chatId] || {};
    }, [typingUsers, chatId]);

    // Filter out current user from typers
    const typingIndicators = useMemo(() => {
        return Object.entries(currentChatTypers || {})
            .filter(([userId]) => userId !== currentUserId)
            .map(([userId, username]) => ({ userId, username }));
    }, [currentChatTypers, currentUserId]);

    // Set up socket listeners
    useEffect(() => {
        if (socket) {
            // Listen for typing events
            socket.on(TYPING, (data) => {
                if (data.chatId === chatId && data.user && data.user._id !== currentUserId) {
                    setUserTyping(chatId, data.user._id, data.user.name);
                }
            });

            // Listen for stop typing events
            socket.on(STOP_TYPING, (data) => {
                if (data.chatId === chatId && data.user) {
                    removeUserTyping(chatId, data.user._id);
                }
            });

            // Clean up typing indicators when user joins chat
            socket.on(NEW_MESSAGE, (data) => {
                if (data.chatId === chatId && data.message?.sender?._id) {
                    removeUserTyping(chatId, data.message.sender._id);
                }
            });
        }

        return () => {
            if (socket) {
                socket.off(TYPING);
                socket.off(STOP_TYPING);
            }
        };
    }, [socket, chatId, currentUserId, setUserTyping, removeUserTyping]);

    if (isLoading) {
        return <div className="flex-1 p-4">Loading messages...</div>;
    }

    if (error) {
        return <div className="flex-1 p-4 text-red-500">Error loading messages: {error.message}</div>;
    }

    return (
        <div 
            ref={containerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-transparent"
        >
            {/* Load More Messages Trigger at the top with increased visibility */}
            <div 
                ref={observerTarget} 
                className="h-10 flex items-center justify-center"
            >
                {isFetchingNextPage ? (
                    <div className="text-center text-sm text-neutral-400 py-2">
                        Loading older messages...
                    </div>
                ) : hasNextPage ? (
                    <div className="text-center text-xs text-neutral-500">
                        Scroll up for more messages
                    </div>
                ) : null}
            </div>

            {/* Display messages with correct order - oldest at top, newest at bottom */}
            {processedMessages.map((message, index) => {
                const isSender = message.sender._id === currentUserId;
                
                // Create a unique key using both message ID and index
                const uniqueKey = `${message._id}-${index}`;
                
                return (
                    <Message 
                        key={uniqueKey} 
                        message={message} 
                        isSender={isSender}
                    />
                );
            })}

            {/* Typing indicators, added at the end of the list */}
            {typingIndicators.map((typer) => (
                <TypingIndicator key={typer.userId} username={typer.username} />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

Message.propTypes = {
    message: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        sender: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
        }).isRequired,
        content: PropTypes.string,
        createdAt: PropTypes.string.isRequired,
        readBy: PropTypes.arrayOf(PropTypes.string),
        attachments: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string,
                url: PropTypes.string.isRequired
            })
        )
    }).isRequired,
    isSender: PropTypes.bool.isRequired
};

ChatMessage.propTypes = {
    chatId: PropTypes.string.isRequired
};

export default ChatMessage;