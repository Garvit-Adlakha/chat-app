import { ChatHeader } from "../layout/ChatHeader";
import { ChatMessage } from "../layout/ChatMessage";
import { MessageInput } from "../layout/MessageInput";
import { useChat } from "../../hooks/useChat";

const ChatWindow = ({ chatId }) => {
    const { messages, loading, error, sendMessage,chatInfo } = useChat(chatId);
  
    return (
      <section className="chat-window h-[90vh] rounded-2xl bg-neutral-900/95 backdrop-blur-xl shadow-2xl flex flex-col">
        <ChatHeader {...chatInfo} />
        <ChatMessage messages={messages} />
        <MessageInput onSendMessage={sendMessage} />
      </section>
    );
  };

  export default ChatWindow