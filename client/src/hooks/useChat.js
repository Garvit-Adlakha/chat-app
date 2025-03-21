import { useState } from "react";

// Mock data for different chats
const mockChats = {
    "friend1": {
        id: "friend1",
        name: "Alice Smith",
        participants: ["user1", "friend1"],
        created: new Date().toISOString(),
        messages: [
            { id: 1, content: "Hey, how are you?", sender: "user1", timestamp: new Date().toISOString(), status: "delivered" },
            { id: 2, content: "I'm good, thanks!", sender: "friend1", timestamp: new Date().toISOString(), status: "seen" },
        ]
    },
    "friend2": {
        id: "friend2",
        name: "Bob Johnson",
        participants: ["user1", "friend2"],
        created: new Date().toISOString(),
        messages: [
            { id: 1, content: "Did you see the meeting notes?", sender: "friend2", timestamp: new Date().toISOString(), status: "seen" },
            { id: 2, content: "Yes, I'll review them soon", sender: "user1", timestamp: new Date().toISOString(), status: "sent" },
        ]
    },
    "friend3": {
        id: "friend3",
        name: "Carol Williams",
        participants: ["user1", "friend3"],
        created: new Date().toISOString(),
        messages: [
            { id: 1, content: "Let's catch up soon!", sender: "friend3", timestamp: new Date().toISOString(), status: "seen" },
            { id: 2, content: "Definitely!", sender: "user1", timestamp: new Date().toISOString(), status: "delivered" },
        ]
    }
};

export const useChat = (chatId) => {
    const [messages, setMessages] = useState(mockChats[chatId]?.messages || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [chatInfo, setChatInfo] = useState({
        id: chatId,
        name: mockChats[chatId]?.name || "Unknown Chat",
        participants: mockChats[chatId]?.participants || [],
        created: mockChats[chatId]?.created || new Date().toISOString()
    });

    const sendMessage = async (content) => {
        try {
            const newMessage = {
                id: messages.length + 1,
                content,
                sender: "user1",
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, newMessage]);
            console.log(newMessage);
        } catch (error) {
            console.error("Error :: sendMessage", error);
        }
    };

    return { messages, loading, error, sendMessage, chatInfo };
};
