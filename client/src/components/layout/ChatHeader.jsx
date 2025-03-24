import {
    IconPhone,
    IconVideo,
    IconDotsVertical
} from '@tabler/icons-react';
import { useReducer, useRef, useState } from 'react';
import ChatProfile from '../profile/ChatProfile';
import { useClickOutside } from '../../hooks/UseClickOutside';

const chatData = {
    _id: "chat123",
    name:"Project Discussion",
    isGroupChat: true,
    description: "Team chat for discussing project updates",
    createdAt: "2024-03-17T10:00:00.000Z",
    members: [
        {
            _id: "user1",
            name: "John Doe",
            email: "john@example.com",
            avatar: { url: "https://api.dicebear.com/6.x/avataaars/svg?seed=John" }
        },
        {
            _id: "user2",
            name: "Alice Smith",
            email: "alice@example.com",
            avatar: { url: "https://api.dicebear.com/6.x/avataaars/svg?seed=Alice" }
            
        },
        // {
        //     _id: "user3",
        //     name: "Bob Johnson",
        //     email: "bob@example.com",
        //     avatar: { url: "https://api.dicebear.com/6.x/avataaars/svg?seed=Bob" }
        // },
        // {
        //     _id: "user4",
        //     name: "Emma Davis",
        //     email: "emma@example.com",
        //     avatar: { url: "https://api.dicebear.com/6.x/avataaars/svg?seed=Emma" }
        // },
        // {
        //     _id: "user5",
        //     name: "Michael Wilson",
        //     email: "michael@example.com",
        //     avatar: { url: "https://api.dicebear.com/6.x/avataaars/svg?seed=Michael" }
        // }
    ]
};

const ChatActions = () => {
    return (
        <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-neutral-700 rounded-full transition-colors">
                <IconPhone className="w-5 h-5 text-neutral-300" />
            </button>
            <button className="p-2 hover:bg-neutral-700 rounded-full transition-colors">
                <IconVideo className="w-5 h-5 text-neutral-300" />
            </button>
            <button className="p-2 hover:bg-neutral-700 rounded-full transition-colors">
                <IconDotsVertical className="w-5 h-5 text-neutral-300" />
            </button>
        </div>
    );
};

export const ChatHeader = ({ name, avatar, isOnline }) => {
    const [isProfileOpen,setIsProfileOpen]=useState(false);
    const clickHandler=()=>{
        setIsProfileOpen(true);
    }
    const ChatProfileRef=useRef(null)
    useClickOutside(ChatProfileRef,()=>setIsProfileOpen(false))
    
    return (
    <>
        <header className="p-2 mx-12 bg-neutral-800/80 backdrop-blur-xl z-10">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 cursor-pointer"
                    onClick={clickHandler}
                    >
                    <div className="relative">
                        <div className="avatar">
                            <div className="w-12 rounded-full">
                                <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{name}</h3>
                        <p className="text-xs text-neutral-400">{isOnline ? 'Online' : 'Offline'}</p>
                    </div>
                </div>
                <ChatActions />
            </div>
        </header>
        <main className='w-full h-full"'>
        {
            isProfileOpen && <ChatProfile  Ref={ChatProfileRef}
            chat={chatData}
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            />
        }
        </main>
        </>
    );
};