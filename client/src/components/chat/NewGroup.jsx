import { useState } from 'react';
import { IconX, IconSearch, IconUserPlus, IconPhoto } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import userService from '../../service/userService';
import chatService from '../../service/chatService';
import toast from 'react-hot-toast';
import VisuallyHiddenInput from '../shared/VisuallyHiddenInput';

const NewGroup = ({ isOpen, onClose }) => {
    const [groupName, setGroupName] = useState('');
    const [groupIcon, setGroupIcon] = useState(null);
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
            setGroupIcon(null);
            setSelectedUsers({});
            toast.success("Group created successfully");
            onClose();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create group");
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const memberIds = Object.keys(selectedUsers);
        if (memberIds.length === 0) {
            toast.error("Please select at least one member for your group");
            return;
        }

        if (!groupName.trim()) {
            toast.error("Please enter a group name");
            return;
        }
        
        if (groupName.trim().length > 50) {
            toast.error("Group name should be less than 50 characters");
            return;
        }

        mutate({ 
            name: groupName.trim(),
            members: memberIds,
            icon: groupIcon
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Image size should be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                setGroupIcon(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-999"
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
                        {/* Group Icon Selector */}
                        <div className="flex flex-col items-center mb-4">
                            <h3 className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Group Icon
                            </h3>
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative group cursor-pointer">
                                    <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden border-2 border-blue-300 dark:border-blue-700">
                                        {groupIcon ? (
                                            <img src={groupIcon} alt="Group Icon" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-neutral-500 dark:text-neutral-400">No Icon</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('group-icon-input').click()}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors"
                                    >
                                        <IconPhoto size={18} />
                                        Upload Image
                                    </button>
                                </div>
                                <VisuallyHiddenInput
                                    id="group-icon-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        {/* Group Name Input */}
                        <div>
                            <label  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                <input
                                type="text"
                                name='groupName'
                                maxLength={50}
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter group name"
                                required
                            />
                              </label>
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
                                name='search'
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

export default NewGroup;