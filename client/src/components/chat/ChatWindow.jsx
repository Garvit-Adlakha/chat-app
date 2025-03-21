import { ChatHeader } from "../layout/ChatHeader";
import { ChatMessage } from "../layout/ChatMessage";
import { MessageInput } from "../layout/MessageInput";
import { useChat } from "../../hooks/useChat";
import { useEffect } from "react";

const ChatWindow = ({ chatId }) => {
    const { messages, loading, error, sendMessage, chatInfo } = useChat(chatId);
    useEffect(() => {
  
    }, [chatId]);

    if (loading) {
        return (
            <section className="chat-window h-[90vh] rounded-2xl bg-neutral-900/95 backdrop-blur-xl shadow-2xl flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </section>
        );
    }

    if (error) {
        return (
            <section className="chat-window h-[90vh] rounded-2xl bg-neutral-900/95 backdrop-blur-xl shadow-2xl flex items-center justify-center">
                <ErrorMessage 
                    message={error.message || "Failed to load chat"} 
                    retry={() => window.location.reload()} 
                />
            </section>
        );
    }

    if (!chatInfo) {
        return (
            <section className="chat-window h-[90vh] rounded-2xl bg-neutral-900/95 backdrop-blur-xl shadow-2xl flex items-center justify-center">
                <p className="text-neutral-400">No chat selected</p>
            </section>
        );
    }

    return (
        <section className="
            chat-window h-[90vh] rounded-2xl 
            bg-neutral-900/95 backdrop-blur-xl shadow-2xl 
            flex flex-col relative overflow-hidden
        ">
            <ChatHeader {...chatInfo} />
            
            <div className="flex-1 overflow-y-auto">
                <ChatMessage messages={messages}  currentUserId={chatId}/>
            </div>
            
            <MessageInput 
                onSendMessage={sendMessage} 
                disabled={loading}
            />
        </section>
    );
};

// Create shared components for loading and error states
const LoadingSpinner = ({ size = "md" }) => (
    <div className={`
        animate-spin rounded-full 
        border-4 border-neutral-300 border-t-blue-500
        ${size === "lg" ? "w-12 h-12" : "w-6 h-6"}
    `} />
);

const ErrorMessage = ({ message, retry }) => (
    <div className="text-center p-4">
        <p className="text-red-500 mb-4">{message}</p>
        {retry && (
            <button 
                onClick={retry}
                className="btn btn-outline btn-error btn-sm"
            >
                Try Again
            </button>
        )}
    </div>
);

export default ChatWindow;