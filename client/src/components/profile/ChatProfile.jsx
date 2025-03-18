import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    IconUserPlus,
    IconUsers,
    IconCalendar,
    IconInfoCircle,
    IconX,
    IconPencil
} from '@tabler/icons-react';
import Avatar from '../shared/Avatar';

// Dummy data

const ChatProfile = ({ chat = DUMMY_CHAT, isOpen, onClose }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [chatInfo, setChatInfo] = useState({
        name: '',
        description: '',
        members: []
    });

    useEffect(() => {
        if (chat) {
            setChatInfo({
                name: chat.name || "Group Name",
                description: chat.description || "No description available",
                members: chat.members || []
            });
        }
    }, [chat]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleSaveName = () => {
        // TODO: Implement save functionality
        setIsEditing(false);
    };

    return (
        <dialog
            id="chat_profile"
            className={`
                modal ${isOpen ? 'modal-open' : ''} 
                fixed inset-0 z-50 
                backdrop-blur-sm bg-black/50
            `}
        >
            <div className="
                fixed right-0 top-0 bottom-0
                w-full sm:w-96 
                bg-white dark:bg-neutral-800
                shadow-xl
                overflow-hidden
                flex flex-col
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            ">
                {/* Header */}
                <header className="
                    flex justify-between items-center 
                    p-4 
                    bg-white/80 dark:bg-neutral-800/80
                    backdrop-blur-md
                    border-b border-neutral-200 dark:border-neutral-700
                ">
                    <h3 className="text-lg font-bold">Chat Info</h3>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-circle btn-ghost"
                    >
                        <IconX className="w-5 h-5" />
                    </button>
                </header>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto">
                    {/* Profile Section */}
                    <div className="p-6 text-center">
                        <div className="mb-4">
                            {chat?.isGroupChat ? (
                                <div className="avatar placeholder mx-auto">
                                    <div className="w-24 rounded-full bg-neutral-200 dark:bg-neutral-700">
                                        <IconUsers className="w-12 h-12 text-neutral-500" />
                                    </div>
                                </div>
                            ) : (
                                <div className="avatar mx-auto">
                                    <div className="w-24 rounded-full ring ring-primary ring-offset-2">
                                        <Avatar
                                            src={chat?.members[0]?.avatar?.url}
                                            alt={chat?.name}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="flex items-center gap-2 justify-center">
                                <input
                                    type="text"
                                    value={chatInfo.name}
                                    onChange={(e) => setChatInfo(prev => ({
                                        ...prev,
                                        name: e.target.value
                                    }))}
                                    className="input input-bordered input-sm max-w-[200px]"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSaveName}
                                    className="btn btn-sm btn-primary"
                                >
                                    Save
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <h2 className="text-xl font-bold">
                                    {chatInfo.name}
                                </h2>
                                {chat?.isGroupChat && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="btn btn-ghost btn-sm btn-circle"
                                    >
                                        <IconPencil className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Info Cards */}
                    <div className="px-4 space-y-2">
                        <div className="card bg-base-200">
                            <div className="card-body p-3 flex-row items-center">
                                <IconInfoCircle className="w-5 h-5 text-blue-500" />
                                <div>
                                    <h4 className="text-sm font-medium">Type</h4>
                                    <p className="text-sm opacity-70">
                                        {chat?.isGroupChat ? 'Group Chat' : 'Direct Message'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-base-200">
                            <div className="card-body p-2 flex-row items-center">
                                <IconCalendar className="w-5 h-5 text-green-500" />
                                <div>
                                    <h4 className="text-sm font-medium">Created</h4>
                                    <p className="text-sm opacity-70">
                                        {new Date(chat?.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-base-200">
                            <div className="card-body p-3 flex-row items-center">
                                <IconUsers className="w-5 h-5 text-purple-500" />
                                <div>
                                    <h4 className="text-sm font-medium">Members</h4>
                                    <p className="text-sm opacity-70">
                                        {chat?.members?.length || 0} participants
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="px-4 mt-4 pb-20"> {/* Added pb-20 for button space */}
                        <h4 className="text-sm font-medium opacity-70 mb-3">
                            Participants ({chat?.members?.length})
                        </h4>
                        <div className="space-y-1">
                            {chat?.members?.map((member) => (
                                <div
                                    key={member._id}
                                    className="
                                        flex items-center p-2
                                        hover:bg-neutral-100 dark:hover:bg-neutral-700
                                        rounded-lg transition-colors
                                    "
                                >
                                    <Avatar
                                        src={member.avatar?.url}
                                        alt={member.name}
                                        className="w-8 h-8"
                                    />
                                    <div className="ml-3">
                                        <p className="text-sm font-medium">
                                            {member.name}
                                        </p>
                                        <p className="text-xs opacity-70">
                                            {member.email}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Button - Fixed at bottom */}
                {chat?.isGroupChat && (
                    <div className="
                        p-4
                        bg-white/80 dark:bg-neutral-800/80
                        backdrop-blur-md
                        border-t border-neutral-200 dark:border-neutral-700
                    ">
                        <button
                            className="btn btn-primary w-full gap-2"
                            onClick={() => {/* TODO: Implement add member */}}
                        >
                            <IconUserPlus className="w-5 h-5" />
                            Add Participants
                        </button>
                    </div>
                )}
            </div>
        </dialog>
    );
};

ChatProfile.propTypes = {
    chat: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        isGroupChat: PropTypes.bool.isRequired,
        description: PropTypes.string,
        createdAt: PropTypes.string.isRequired,
        members: PropTypes.arrayOf(
            PropTypes.shape({
                _id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
                email: PropTypes.string.isRequired,
                avatar: PropTypes.shape({
                    url: PropTypes.string.isRequired
                })
            })
        ).isRequired
    }),
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default ChatProfile;