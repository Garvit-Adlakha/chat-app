import { ChatHeader } from "../layout/ChatHeader";
import { ChatMessage } from "../layout/ChatMessage";
import { MessageInput } from "../layout/MessageInput";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

const ChatWindow = ({ chatId }) => {
    console.log("chat id from chatWindow",chatId)
    useEffect(() => {
  
    }, [chatId]);
    return (
        <section className="
            chat-window h-[90vh] rounded-2xl 
            bg-neutral-900/95 backdrop-blur-xl shadow-2xl 
            flex flex-col relative overflow-hidden
        ">
            <ChatHeader chatId={chatId} />
            
            <div className="flex-1 overflow-y-auto">
                <ChatMessage chatId={chatId}/>
            </div>
            
            <MessageInput chatId={chatId}
                members={chatId.members}
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


export default ChatWindow;