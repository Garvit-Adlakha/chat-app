import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';

// Mock data for testing

const MessageStatus = ({ status }) => {
    const statusConfig = {
        sent: { color: 'text-gray-400', icon: '✓' },
        delivered: { color: 'text-blue-400', icon: '✓✓' },
        seen: { color: 'text-green-400', icon: '✓✓' }
    };

    return (
        <span className={`text-xs ${statusConfig[status].color}`}>
            {statusConfig[status].icon}
        </span>
    );
};

const Message = ({ message, isSender }) => (
    <div className={`chat ${isSender ? 'chat-end' : 'chat-start'} `}>
        <div className="chat-image avatar">
            <div className="w-10 rounded-full ring-1 ring-neutral-700 overflow-hidden">
                <img 
                    src={message.avatar} 
                    alt={`${message.sender.name}'s avatar`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = 'https://api.dicebear.com/6.x/avataaars/svg?seed=fallback';
                    }}
                />
            </div>
        </div>
        <div className="chat-header text-neutral-400">
            {message.sender.name}
            <time className="text-xs opacity-50 ml-2" dateTime={message.timestamp}>
                {message.timestamp}
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
        </div>
        {isSender && (
            <div className="chat-footer opacity-50">
                <MessageStatus status={message.status} />
            </div>
        )}
    </div>
);

export const ChatMessage = ({ messages, currentUserId = 'user1' }) => {
    const messagesEndRef = useRef(null);
    const chatMessages = messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-transparent">
            {chatMessages.map((message, index) => {
                const isSender = message.sender === currentUserId;
                console.log(message.sender)
                const showAvatar = index === 0 || 
                    chatMessages[index - 1].sender.id !== message.sender.id;
                
                return (
                    <Message 
                        key={message.id} 
                        message={message} 
                        isSender={isSender}
                        showAvatar={showAvatar}
                    />
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};

Message.propTypes = {
    message: PropTypes.shape({
        id: PropTypes.number.isRequired,
        avatar: PropTypes.string.isRequired,
        sender: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired
        }).isRequired,
        content: PropTypes.string.isRequired,
        timestamp: PropTypes.string.isRequired,
        status: PropTypes.oneOf(['sent', 'delivered', 'seen']).isRequired,
    }).isRequired,
    isSender: PropTypes.bool.isRequired,
    showAvatar: PropTypes.bool.isRequired
};

ChatMessage.propTypes = {
    messages: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            avatar: PropTypes.string.isRequired,
            sender: PropTypes.shape({
                id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired
            }).isRequired,
            content: PropTypes.string.isRequired,
            timestamp: PropTypes.string.isRequired,
            status: PropTypes.oneOf(['sent', 'delivered', 'seen']).isRequired,
        })
    ),
    currentUserId: PropTypes.string
};



export default ChatMessage;