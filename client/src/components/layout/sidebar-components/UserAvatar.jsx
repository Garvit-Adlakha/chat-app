import { useQuery } from '@tanstack/react-query';
import React from 'react';
import userService from '../../../service/userService';

export const UserAvatar = ({ onClick, isActive }) => {
    const{data: user} = useQuery({
        queryKey: ['user'],
        queryFn: userService.currentUser,
    });

    return (
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
            <img
                src={user.avatar.url}
                alt={user.name}
                className="w-10 h-10 rounded-full"
            />
            <span 
                className={`
                    absolute bottom-1 right-1
                    w-3 h-3 rounded-full
                    border-2 border-white dark:border-neutral-900
                    ${user.isOnline ? 'bg-green-500' : 'bg-neutral-400'}
                `}
            />
        </button>
    );
};