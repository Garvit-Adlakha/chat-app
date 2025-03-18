import { useState } from "react";

export const useChat = (chatId) => {
    // Dummy data for testing
    const dummyMessages = [
        { id: 1, content: "Hey there!", sender: "user1", timestamp: new Date().toISOString() },
        { id: 2, content: "Hi! How are you?", sender: "user2", timestamp: new Date().toISOString() },
        { id: 3, content: "I'm doing great!", sender: "user1", timestamp: new Date().toISOString() },
    ];

    const dummyChatInfo = {
        id: chatId,
        name: "Test Chat",
        participants: ["user1", "user2"],
        created: new Date().toISOString()
    };

    const [messages, setMessages] = useState(dummyMessages);
    const [loading, setLoading] = useState(false); // Set to false for testing
    const [error, setError] = useState(null);
    const [chatInfo, setChatInfo] = useState(dummyChatInfo);

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
