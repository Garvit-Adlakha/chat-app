import { ChatHeader } from "../layout/ChatHeader";
import { ChatMessage } from "../layout/ChatMessage";
import { MessageInput } from "../layout/MessageInput";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import chatService from "../../service/chatService";
import Loading from "../shared/Loading";

const ChatWindow = ({ chatId }) => {
    useEffect(() => {
  
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
        <section className="
            chat-window h-[90vh] rounded-2xl bg-white/80
            dark:bg-neutral-900/95 backdrop-blur-xl shadow-2xl 
            flex flex-col relative overflow-hidden
        ">
            <ChatHeader chatId={chatId} />
            
            <div className="flex-1 overflow-y-auto">
                <ChatMessage chatId={chatId}/>
            </div>
            
            <MessageInput chatId={chatId}
                members={chatData.members}
            />
        </section>
    );
};

// Create shared components for loading and error states


export default ChatWindow;