import PropTypes from 'prop-types';
import { memo } from 'react';

const Message = memo(({ message, isSender }) => (
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
                        <a 
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={index} 
                            className="text-sm text-blue-200 hover:text-blue-100 underline cursor-pointer"
                            onClick={(e) => {
                                e.preventDefault();
                                window.open(attachment.url, '_blank');
                            }}
                        >
                            {attachment.name}
                        </a>
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
));

Message.propTypes = {
    message: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        chat: PropTypes.string.isRequired,
        sender: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired
        }).isRequired,
        content: PropTypes.string.isRequired,
        readBy: PropTypes.arrayOf(PropTypes.string),
        attachments: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                url: PropTypes.string.isRequired,
                publicId: PropTypes.string
            })
        ),
        createdAt: PropTypes.string.isRequired,
        updatedAt: PropTypes.string.isRequired,
        __v: PropTypes.number
    }).isRequired,
    isSender: PropTypes.bool.isRequired
};

export default Message;