import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import chatService from '../../service/chatService';
import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';
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
            if (lastPage.currentPage < lastPage.totalPages) {
                return lastPage.currentPage + 1;
            }
            return undefined;
        },
        select: (data) => ({
            pages: data.pages.map(page => ({
                ...page,
                messages: page.messages.sort((a, b) => 
                    new Date(a.createdAt) - new Date(b.createdAt)
                )
            })),
            pageParams: data.pageParams
        }),
        initialPageParam: 1
    });
    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.5 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Scroll to bottom on new messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [data]);

    // Flatten all messages from all pages
    const chatMessages = data?.pages.flatMap(page => page.messages) ?? [];

    useEffect(() => {
        if (socket) {
            socket.on(NEW_MESSAGE, ({chatId: receivedChatId, message}) => {
                if (chatId === receivedChatId) {
                    queryClient.setQueryData(['messages', chatId], (oldData) => {
                        if (!oldData) return oldData;
                        
                        const newPages = [...oldData.pages];
                        const lastPageIndex = newPages.length - 1;
                        newPages[lastPageIndex] = {
                            ...newPages[lastPageIndex],
                            messages: [...newPages[lastPageIndex].messages, message].sort(
                                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                            )
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-transparent">
            {/* Load More Messages Trigger */}
            <div ref={observerTarget} className="h-4">
                {isFetchingNextPage && (
                    <div className="text-center text-sm text-neutral-400">
                        Loading more messages...
                    </div>
                )}
            </div>

            {chatMessages.map((message, index) => {
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
    messages: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            sender: PropTypes.shape({
                id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired
            }).isRequired,
            content: PropTypes.string.isRequired,
            timestamp: PropTypes.string.isRequired
        })
    ),
    currentUserId: PropTypes.string
};

export default ChatMessage;