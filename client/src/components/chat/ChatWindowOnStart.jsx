import React from 'react';
import { IconMessages, IconArrowLeft } from '@tabler/icons-react';

const ChatWindowOnStart = () => {
    return (
        <section className="
           h-full flex flex-col items-center justify-center
            bg-gradient-to-br from-white to-neutral-50
            dark:from-neutral-900 dark:to-neutral-800
            p-8 rounded-2xl
        ">
            <div className="
                max-w-md w-full
                bg-white dark:bg-neutral-800
                shadow-lg rounded-2xl
                p-8
                text-center
                transform transition-all
                hover:scale-105
                border border-neutral-100 dark:border-neutral-700
            ">
                <div className="
                    w-16 h-16 mx-auto mb-6
                    bg-blue-500/10 dark:bg-blue-500/20
                    rounded-full
                    flex items-center justify-center
                ">
                    <IconMessages 
                        className="w-8 h-8 text-blue-500" 
                        stroke={1.5} 
                    />
                </div>

                <h2 className="
                    text-2xl font-bold
                    text-neutral-800 dark:text-neutral-100
                    mb-4
                ">
                    Start a Conversation
                </h2>

                <p className="
                    text-neutral-600 dark:text-neutral-300
                    leading-relaxed mb-6
                ">
                    Welcome to our chat app! Select a user from the sidebar 
                    <IconArrowLeft className="inline mx-2 text-blue-500" />
                    to begin a conversation.
                </p>

                <div className="
                    flex flex-wrap gap-2 justify-center
                    text-sm text-neutral-500 dark:text-neutral-400
                ">
                    <Feature icon="💬" text="Real-time messaging" />
                    <Feature icon="🌐" text="Connect with others" />
                    <Feature icon="🔒" text="Secure chats" />
                </div>
            </div>
        </section>
    );
};

// Feature component for better organization
const Feature = ({ icon, text }) => (
    <div className="
        flex items-center gap-2
        bg-neutral-50 dark:bg-neutral-700/50
        px-4 py-2 rounded-full
    ">
        <span>{icon}</span>
        <span>{text}</span>
    </div>
);

export default ChatWindowOnStart;