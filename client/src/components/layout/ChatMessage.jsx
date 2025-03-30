import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import chatService from '../../service/chatService';
import PropTypes from 'prop-types';
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import useSocketStore from '../socket/Socket';
import { NEW_MESSAGE } from '../../constants/event';

const Message = ({ message, isSender }) => (
    <div className={`chat ${isSender ? 'chat-end' : 'chat-start'}`}>
        <div className="chat-header text-neutral-400 text-xs">
            {message.sender.name}
            <time 
                className="ml-2 opacity-50" 
                dateTime={message.createdAt}
                title={new Date(message.createdAt).toLocaleString()}
            >
                {new Date(message.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}
            </time>
        </div>
        <div 
            className={`chat-bubble ${
                isSender 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-neutral-700 text-white'
            } max-w-md break-words`}
        >
            {message.content}
            {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                    {message.attachments.map((attachment, index) => (
                        <div key={index} className="text-sm text-blue-200 underline">
                            {attachment.name}
                        </div>
                    ))}
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
    </div>
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
            // Record the current scroll height before loading more
            if (containerRef.current) {
                setPrevScrollHeight(containerRef.current.scrollHeight);
                console.log("Recording height before fetch:", containerRef.current.scrollHeight);
            }
            
            setIsFetchingMore(true);
            fetchNextPage()
                .then(() => {
                    // After fetching, check if the scroll height has changed
                    if (containerRef.current) {
                        const newScrollHeight = containerRef.current.scrollHeight;
                        console.log("New height after fetch:", newScrollHeight);
                        // Adjust scroll position if the height has changed
                        if (newScrollHeight !== prevScrollHeight) {
                            const scrollDiff = newScrollHeight - prevScrollHeight;
                            containerRef.current.scrollTop += scrollDiff;
                            console.log("Adjusted scroll position by:", scrollDiff);
                        }
                    }
                    console.log("Successfully fetched next page");
                })
                .catch(err => {
                    console.error("Error fetching next page:", err);
                })
                .finally(() => {
                    setTimeout(() => setIsFetchingMore(false), 1000);
                });
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, isFetchingMore]);

    // Track when new pages are loaded
    useEffect(() => {
        if (data?.pages) {
            const newPageCount = data.pages.length;
            console.log("Page count:", newPageCount, "Previous:", pageCount);
            if (newPageCount > pageCount) {
                setPageCount(newPageCount);
            }
        }
    }, [data?.pages, pageCount]);

    // Adjust scroll after loading more messages

    // Use Intersection Observer for loading older messages
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    console.log("Observer triggered, fetching more messages");
                    debouncedFetch();
                }
            },
            { threshold: 0.1, rootMargin: "100px 0px 0px 0px" }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [debouncedFetch]);

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
            {processedMessages.map((message) => {
                const isSender = message.sender._id === currentUserId;
                
                return (
                    <Message 
                        key={message._id} 
                        message={message} 
                        isSender={isSender}
                    />
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};

Message.propTypes = {
    message: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        sender: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired
        }).isRequired,
        content: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        readBy: PropTypes.arrayOf(PropTypes.string),
        attachments: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
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