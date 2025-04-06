import { useQuery } from '@tanstack/react-query';
import React from 'react';
import userService from '../../../service/userService';
import Avatar from '../../shared/Avatar';

export const UserAvatar = ({ onClick, isActive, size = "default" }) => {
    const{data: user} = useQuery({
        queryKey: ['user'],
        queryFn: userService.currentUser,
    });

    return (
        <div className="relative group">
            <button
                onClick={onClick}
                className={`
                    relative p-2
                    rounded-full
                    transition-all duration-200
                    hover:scale-110

                    ${isActive ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-neutral-900' : ''}
                `}
                aria-label="Profile Settings"
            >
                <Avatar
                    user={user}
                    alt={user?.name || 'User'}
                    className="w-10 h-10 rounded-full"
                />
                <span 
                    className={`
                        absolute bottom-1 right-1
                        w-3 h-3 rounded-full
                        border-2 border-white dark:border-neutral-900
                        ${user?.isOnline ? 'bg-green-500' : 'bg-neutral-400'}
                    `}
                />
            </button>

            <div className="absolute left-16 top-1/2 -translate-y-1/2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[1000]">
                Your Profile
            </div>
        </div>
    );
};