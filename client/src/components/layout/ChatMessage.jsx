import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import chatService from '../../service/chatService';
import PropTypes from 'prop-types';
import { useRef, useEffect, useState, useMemo, useCallback, memo } from 'react';
import useSocketStore from '../socket/Socket';
import { NEW_MESSAGE, TYPING, STOP_TYPING } from '../../constants/event';
import { motion } from 'framer-motion';
import useChatStore from '../../store/chatStore';
import Message from './Message';
import {debounce} from 'lodash'
import Loading from '../shared/Loading';

const TypingIndicator = memo(({ username }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="chat chat-start"
    >
        <div className="chat-bubble bg-neutral-700/40 backdrop-blur-sm flex items-center gap-2 min-h-0 py-2 px-4 rounded-2xl shadow-sm">
            <div className="flex space-x-1.5">
                <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.25 }}
                    className="w-2 h-2 rounded-full bg-white/80"
                />
                <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.25, delay: 0.15 }}
                    className="w-2 h-2 rounded-full bg-white/80"
                />
                <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.25, delay: 0.3 }}
                    className="w-2 h-2 rounded-full bg-white/80"
                />
            </div>
            <span className="text-xs text-neutral-300">{username} is typing...</span>
        </div>
    </motion.div>
));

TypingIndicator.propTypes = {
    username: PropTypes.string.isRequired
};

export const ChatMessage = ({ chatId }) => {
    const messagesEndRef = useRef(null);
    const observerTarget = useRef(null);
    const containerRef = useRef(null);
    const [firstLoad, setFirstLoad] = useState(true);
    const [pageCount, setPageCount] = useState(0);
    const queryClient = useQueryClient();
    const { data: currentUser } = useQuery({
        queryKey: ["user"],
        queryFn: () => chatService.getCurrentUser()
    })
    const { socket } = useSocketStore()
    const { typingUsers, setUserTyping, removeUserTyping } = useChatStore();

    const currentUserId = currentUser?._id || '';
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
    const debouncedFetch = useMemo(() => {
        return debounce(async () => {
            if (hasNextPage && !isFetchingNextPage && containerRef.current) {
                const container = containerRef.current;
                const prevScrollHeight = container.scrollHeight; // Store previous height
    
                await fetchNextPage();
    
                requestAnimationFrame(() => {
                    if (container) {
                        // Maintain scroll position
                        container.scrollTop = container.scrollHeight - prevScrollHeight + 10; // Add padding to avoid retriggering
                    }
                });
            }
        }, 800);
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
    
    
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
                if (entries[0].isIntersecting) {
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
    }, [debouncedFetch]);

    const scrollToBottom = useCallback((behavior = "smooth") => {
        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior });
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior });
            }, 100); 
        });
    }, []);
    
    useEffect(() => {
        if (data && firstLoad && !isLoading) {
            scrollToBottom("auto"); // Ensure instant scroll at first load
            setFirstLoad(false);
        }
    }, [data, isLoading, firstLoad, scrollToBottom]);
    

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
        if (!socket) return;
        
        socket.on(NEW_MESSAGE, ({ chatId: receivedChatId, message }) => {
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
                            // Add new messages to the end of the array to maintain chronological order
                            messages: [...newPages[firstPageIndex].messages, message]
                        };
                        
                        scrollToBottom();
                        
                        return {
                            ...oldData,
                            pages: newPages
                        };
                    }
                    return oldData;
                });
            }
        });
        
        return () => socket.off(NEW_MESSAGE);
    }, [socket, chatId, queryClient, scrollToBottom]);

    // Extract typing users for current chat
    const typingIndicators = useMemo(() => {
        const currentChatTypers = typingUsers[chatId] || {};
        return Object.entries(currentChatTypers)
            .filter(([userId]) => userId !== currentUserId)
            .map(([userId, username]) => ({ userId, username }));
    }, [typingUsers, chatId, currentUserId]);

    // Set up socket listeners for typing indicators
    useEffect(() => {
        if (!socket) return;
        
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

        return () => {
            socket.off(TYPING);
            socket.off(STOP_TYPING);
        };
    }, [socket, chatId, currentUserId, setUserTyping, removeUserTyping]);
    if (isLoading) {
        return(
        <Loading />
        )
    }

    if (error) {
        return <div className="flex-1 p-4 text-red-500">Error loading messages: {error.message}</div>;
    }

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto px-5 space-y-5 scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-transparent bg-white dark:bg-neutral-900"
        >
            {/* Load More Messages Trigger */}
            <div ref={observerTarget} className="h-10 flex items-center justify-center">
                {isFetchingNextPage ? (
                    <div className="text-center text-sm text-neutral-400 py-2 px-4 bg-neutral-800/30 backdrop-blur-sm rounded-full shadow-inner">
                        Loading older messages...
                    </div>
                ) : hasNextPage ? (
                    <div className="text-center text-xs text-neutral-400 py-1.5 px-3 bg-neutral-800/20 backdrop-blur-sm rounded-full hover:bg-neutral-800/40 transition-colors cursor-pointer">
                        Scroll up for more messages
                    </div>
                ) : null}
            </div>

            {/* Messages */}
            <div className="space-y-4">
                {processedMessages.map((message, index) => {
                    const isSender = message.sender._id === currentUserId;
                    const isConsecutive = index > 0 && processedMessages[index - 1].sender._id === message.sender._id;
                    return (
                        <div key={`${message._id}-${index}`} className={isConsecutive ? "mt-1" : "mt-4"}>
                            <Message message={message} isSender={isSender} />
                        </div>
                    );
                })}

                {/* Typing indicators */}
                {typingIndicators.map((typer) => (
                    <TypingIndicator key={typer.userId} username={typer.username} />
                ))}
                
                <div ref={messagesEndRef} />
            </div>
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