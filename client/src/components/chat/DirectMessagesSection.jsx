import { useState } from 'react';
import { Search } from '../shared/Search';
import Avatar from '../shared/Avatar';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import userService from '../../service/userService';
import chatService from '../../service/chatService';

const DirectMessagesSection = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    // Fetch users from API 
    const { data: users = [], isLoading, error } = useQuery({
        queryKey: ["chats"],
        queryFn: () => chatService.UserChats(),
        enabled: true, 
    });
    
    //update users based on search query
    const filteredUsers = users?.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()));
   

    const handleUserClick = (user) => {
        navigate(`/chat/${user._id}`);
    };

    return (
        <div className="flex flex-col max-h-[90vh]">
            {/* Search Bar */}
            <div className="border-b border-neutral-200 dark:border-neutral-700 mt-1">
                <Search
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            {/* User List */}
            <div className="p-4 overflow-y-auto flex-1">
                {isLoading ? (
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">Loading users...</p>
                ) : error ? (
                    <p className="text-red-500 text-sm">Error fetching users.</p>
                ) : users.length > 0 ? (
                    <div className="space-y-2">
                        {filteredUsers.map(user => (
                            <button
                                key={user._id}
                                onClick={() => handleUserClick(user)}
                                className="w-full flex items-center p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors text-left"
                            >
                                <Avatar 
                                    src={user.avatar} 
                                    alt={user.name} 
                                    className="w-10 h-10 mr-3" 
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                        {user.name}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                        No users found.
                    </p>
                )}
            </div>
        </div>
    );
};

export default DirectMessagesSection;
