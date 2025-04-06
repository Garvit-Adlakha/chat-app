import {
    IconPhone,
    IconVideo,
    IconDotsVertical
} from '@tabler/icons-react';
import { useRef, useState } from 'react';
import ChatProfile from '../profile/ChatProfile';
import { useClickOutside } from '../../hooks/UseClickOutside';
import { useQuery } from '@tanstack/react-query';
import chatService from '../../service/chatService';
import userService from '../../service/userService';
import useChatStore from '../../store/chatStore';
import { formatLastActive } from '../../features/feature';
import Avatar from '../shared/Avatar';

export const ChatHeader = ({ chatId }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const ChatProfileRef = useRef(null);

    // Fetch chat details
    const { data: chatDetails, isLoading } = useQuery({
        queryKey: ['chatDetails', chatId],
        queryFn: () => chatService.getChatDetails(chatId),
        enabled: !!chatId
    });

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: userService.currentUser
    });

    const { isUserOnline, getUserLastActive } = useChatStore();

    // Use useClickOutside hook to close the profile when clicking outside

    // Loading and null states remain unchanged
    if (isLoading) {
        return (
            <header className="p-2 mx-12 bg-neutral-800/80 backdrop-blur-xl z-10">
                <div className="animate-pulse flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-neutral-700" />
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-neutral-700 rounded" />
                            <div className="h-3 w-16 bg-neutral-700 rounded" />
                        </div>
                    </div>
                </div>
            </header>
        );
    }

    if (!chatDetails) return null;

    // Get the other member's info for direct chats
    const otherMember = !chatDetails.isGroupChat ?
        chatDetails.members.find(member => member._id !== user?._id) :
        null;

    // For direct chats: check if the other user is online
    const isOtherUserOnline = !chatDetails?.isGroupChat && otherMember
        ? isUserOnline(otherMember._id)
        : false;

    // Get last active time for direct chats
    const lastActive = !chatDetails?.isGroupChat && otherMember
        ? getUserLastActive(otherMember._id)
        : null;

    return (
        <>
            <header className="p-2 mx-12 bg-neutral-200 dark:bg-neutral-800/80 backdrop-blur-xl z-10">
                <div className="flex justify-between items-center">
                    <div
                        className="flex items-center space-x-4 cursor-pointer"
                        onClick={() => setIsProfileOpen(true)}
                    >
                        <div className="avatar relative">
                            {chatDetails.isGroupChat ? (
                                <div className="tooltip" data-tip={chatDetails.members.slice(0, 3).map(m => m.name).join(', ')}>
                                    <div className="w-12">
                                        <Avatar
                                            src={chatDetails.groupIcon?.url}
                                            alt={chatDetails.name}
                                            className="w-12 h-12"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="w-12 relative">
                                    <Avatar
                                        src={otherMember?.avatar}
                                        alt={otherMember?.name}
                                        className="w-12 h-12"
                                    />
                                    {isOtherUserOnline && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-neutral-800" />
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-800 dark:text-neutral-200">
                                {chatDetails.isGroupChat ? chatDetails.name : otherMember?.name}
                            </h3>
                            <p className="text-xs text-neutral-400">
                                {chatDetails.isGroupChat ?
                                    `${chatDetails.members?.length} members` :
                                    isOtherUserOnline ?
                                        'Online' :
                                        lastActive ? `Last seen ${formatLastActive(lastActive)}` : ''
                                }
                            </p>
                        </div>
                    </div>
                    {/* <ChatActions /> */}
                </div>
            </header>

            {isProfileOpen && (
                <ChatProfile
                    ref={ChatProfileRef}
                    chat={chatDetails}
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                />
            )}
        </>
    );
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