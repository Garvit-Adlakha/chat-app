import React from 'react';

interface User {
    _id: string;
    name: string;
    email: string;
    avatar: {
        url: string;
    };
    isOnline?: boolean;
}

interface UserAvatarProps {
    user: User;
    onClick: () => void;
    isActive: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, onClick, isActive }) => {
    return (
        <button
            onClick={onClick}
            className={`
                relative p-1 mb-6
                rounded-full
                transition-all duration-200
                hover:scale-110
                ${isActive ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-neutral-900' : ''}
            `}
            aria-label="Profile Settings"
        >
            <img
                src={user.avatar.url}
                alt={user.name}
                className="w-10 h-10 rounded-full"
            />
            <span 
                className={`
                    absolute bottom-0 right-0
                    w-3 h-3 rounded-full
                    border-2 border-white dark:border-neutral-900
                    ${user.isOnline ? 'bg-green-500' : 'bg-neutral-400'}
                `}
            />
        </button>
    );
};