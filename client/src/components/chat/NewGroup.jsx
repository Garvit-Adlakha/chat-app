import { useState } from 'react';
import { IconX, IconSearch, IconUserPlus } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import userService from '../../service/userService';
import chatService from '../../service/chatService';
import toast from 'react-hot-toast';

const Modal = ({ isOpen, onClose }) => {
    const [groupName, setGroupName] = useState('');
    const [groupIcon, setGroupIcon] = useState('👥');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState({});

    // Replace user search with friends list query
    const { data: friends = [], isLoading } = useQuery({
        queryKey: ['friends'],
        queryFn: userService.UserFriends,
    });

    // Filter friends based on search query
    const filteredFriends = friends.filter(friend => 
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const queryClient = useQueryClient();
    const { mutate, isPending } = useMutation({
        mutationFn: chatService.createGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groups"] });
            setGroupName('');
            setGroupIcon('👥');
            setSelectedUsers({});
            toast.success("Group created successfully");
            onClose();
        },
        onError: (error) => {
            console.error("Failed to create group:", error);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const memberIds = Object.keys(selectedUsers);
        if (memberIds.length === 0) {
            alert("Please select at least one member for your group");
            return;
        }

        if (!groupName.trim()) {
            alert("Please enter a group name");
            return;
        }
        
        mutate({ 
            name: groupName.trim(),
            members: memberIds
        });
    };

    const handleUserSelect = (user) => {
        if (!selectedUsers[user._id]) {
            setSelectedUsers(prev => ({
                ...prev,
                [user._id]: user
            }));
        }
    };

    const handleRemoveUser = (userId) => {
        const newSelectedUsers = { ...selectedUsers };
        delete newSelectedUsers[userId];
        setSelectedUsers(newSelectedUsers);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white dark:bg-neutral-800 w-full max-w-md rounded-xl shadow-xl transform transition-all">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                            Create New Group
                        </h3>
                        <button
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                            onClick={onClose}
                        >
                            <IconX className="w-5 h-5 text-neutral-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Group Name
                            </label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter group name"
                                required
                            />
                        </div>

                        {/* Selected Users */}
                        {Object.keys(selectedUsers).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {Object.values(selectedUsers).map(user => (
                                    <div key={user._id} 
                                        className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                                        <span className="text-sm">{user.name}</span>
                                        <button type="button" onClick={() => handleRemoveUser(user._id)}>
                                            <IconX className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Friends Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search from your friends..."
                                className="w-full px-4 py-2 pl-10 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <IconSearch className="absolute left-3 top-2.5 w-5 h-5 text-neutral-400" />
                        </div>

                        {/* Friends List */}
                        <div className="max-h-48 overflow-y-auto space-y-2 mt-2">
                            {isLoading ? (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                </div>
                            ) : filteredFriends.length === 0 ? (
                                <p className="text-center text-neutral-500 dark:text-neutral-400 py-4">
                                    {searchQuery ? "No friends found" : "No friends yet"}
                                </p>
                            ) : (
                                filteredFriends.map((friend) => (
                                    <div
                                        key={friend._id}
                                        className="flex items-center justify-between p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg cursor-pointer"
                                        onClick={() => handleUserSelect(friend)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full overflow-hidden">
                                                <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-neutral-800 dark:text-neutral-200">{friend.name}</span>
                                        </div>
                                        <IconUserPlus className="w-5 h-5 text-neutral-500" />
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isPending}
                                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? 'Creating...' : 'Create Group'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Modal;