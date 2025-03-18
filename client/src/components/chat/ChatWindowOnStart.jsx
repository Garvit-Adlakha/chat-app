import React from 'react';

const ChatWindowOnStart = () => {
    return (
        <section className="h-full flex flex-col items-center justify-center bg-gray-50 p-4">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Click on a user to start chatting
            </h2>
            <p className="text-gray-500 text-center max-w-md">
                Welcome to our chat app! Select a user from the sidebar to begin a 
                conversation. You can send messages, share thoughts, and connect with others 
                in real-time.
            </p>
        </section>
    );
};

export default ChatWindowOnStart;