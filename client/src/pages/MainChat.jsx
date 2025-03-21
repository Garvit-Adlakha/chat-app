import { useParams } from 'react-router-dom';
import ChatWindow from '../components/chat/ChatWindow';
import ChatWindowOnStart from '../components/chat/ChatWindowOnStart';
import AppLayout from '../components/layout/AppLayout';
import { useEffect, useState } from 'react';

const MainChat = () => {
    const { chatId } = useParams();
    const [key, setKey] = useState(0); // Add key for forcing re-render

    useEffect(() => {
        // Force re-render of ChatWindow when chatId changes
        setKey(prevKey => prevKey + 1);
    }, [chatId]);

    return (
        <main className='h-[calc(100vh-4rem)] '>
            {chatId ? (
                <ChatWindow 
                    key={key} // Add key prop
                    chatId={chatId} 
                />
            ) : (
                <ChatWindowOnStart />
            )}
        </main>
    );
};

const MainChatComponent = AppLayout()(MainChat);
export default MainChatComponent;