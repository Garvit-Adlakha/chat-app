import { useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useEffect, useState,lazy } from 'react';
const ChatWindow=lazy(() => import('../components/chat/ChatWindow'));
const ChatWindowOnStart=lazy(() => import('../components/chat/ChatWindowOnStart'));


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