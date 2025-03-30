import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IconX, IconUserMinus, IconSearch } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import chatService from '../../service/chatService';
import toast from 'react-hot-toast';
import Avatar from '../shared/Avatar';

const RemoveMemberModal = ({ 
    isOpen, 
    onClose, 
    chatId, 
    currentMembers, 
    currentUserId,
    creatorId,
    onMembersRemoved 
}) => {
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    useEffect(() => {
        // Reset state when modal opens/closes
        if (!isOpen) {
            setSelectedMembers([]);
            setSearchQuery('');
        }
    }, [isOpen]);
    
    const removeMembersMutation = useMutation({
        mutationFn: (data) => chatService.removeMemebrsFromGroup(data),
        onSuccess: () => {
            toast.success(`${selectedMembers.length} member${selectedMembers.length !== 1 ? 's' : ''} removed successfully`);
            onMembersRemoved();
            onClose();
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || 'Failed to remove members';
            toast.error(errorMessage);
        }
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (selectedMembers.length === 0) {
            toast.error('Please select at least one member to remove');
            return;
        }
        
        removeMembersMutation.mutate({
            chatId,
            members: selectedMembers
        });
    };
    
    const handleToggleMember = (memberId) => {
        setSelectedMembers(prev => {
            if (prev.includes(memberId)) {
                return prev.filter(id => id !== memberId);
            } else {
                return [...prev, memberId];
            }
        });
    };
    
    const filteredMembers = currentMembers.filter(member => {
        // Don't show current user
        if (member._id === currentUserId) return false;
        
        // Don't show creator (they can't be removed)
        if (member._id === creatorId) return false;
        
        // Apply search filter if any
        if (searchQuery) {
            return member.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        
        return true;
    });

    return (
        <div 
            className={`
                fixed inset-0 bg-black/40 backdrop-blur-sm 
                flex items-center justify-center z-50
                transition-opacity duration-200
                ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="
                bg-white dark:bg-neutral-800 w-full max-w-md 
                rounded-xl shadow-xl overflow-hidden
                transition-all duration-200 transform
                ${isOpen ? 'scale-100' : 'scale-95'}
            ">
                {/* Header */}
                <div className="
                    py-4 px-5 flex justify-between items-center
                    border-b border-neutral-200 dark:border-neutral-700
                ">
                    <h3 className="text-lg font-semibold">Remove Members</h3>
                    <button 
                        className="btn btn-sm btn-circle btn-ghost" 
                        onClick={onClose}
                    >
                        <IconX className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Search Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IconSearch className="w-5 h-5 text-neutral-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search members..."
                                className="
                                    input input-bordered w-full pl-10
                                    bg-neutral-100 dark:bg-neutral-700
                                    border-neutral-200 dark:border-neutral-600
                                    focus:ring-2 focus:ring-primary/40
                                "
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        {/* Selected Count */}
                        <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                            {selectedMembers.length > 0 ? (
                                <span>
                                    Selected {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} to remove
                                </span>
                            ) : (
                                <span>Select members to remove from the group</span>
                            )}
                        </div>
                        
                        {/* Members List */}
                        <div className="
                            max-h-60 overflow-y-auto 
                            border border-neutral-200 dark:border-neutral-700 rounded-lg
                            bg-neutral-50 dark:bg-neutral-900
                        ">
                            {filteredMembers.length === 0 ? (
                                <div className="p-4 text-center text-sm opacity-70">
                                    {searchQuery ? 'No matching members found' : 'No members available to remove'}
                                </div>
                            ) : (
                                <ul className="p-2 space-y-1">
                                    {filteredMembers.map(member => (
                                        <li key={member._id}>
                                            <label className="
                                                flex items-center p-2 
                                                hover:bg-neutral-200 dark:hover:bg-neutral-700
                                                rounded-md cursor-pointer
                                                transition-colors
                                            ">
                                                <div className="flex items-center flex-1">
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox checkbox-sm mr-3"
                                                        checked={selectedMembers.includes(member._id)}
                                                        onChange={() => handleToggleMember(member._id)}
                                                    />
                                                    <Avatar 
                                                        src={member.avatar} 
                                                        alt={member.name} 
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    <div className="ml-3 flex-1">
                                                        <div className="font-medium">{member.name}</div>
                                                        <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                                            {member.email || ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="
                            flex justify-end gap-3 pt-2
                            border-t border-neutral-200 dark:border-neutral-700 mt-3
                        ">
                            <button 
                                type="button" 
                                className="btn btn-outline"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="
                                    btn bg-red-500 hover:bg-red-600 
                                    text-white border-none gap-2
                                "
                                disabled={selectedMembers.length === 0 || removeMembersMutation.isPending}
                            >
                                {removeMembersMutation.isPending ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Removing...
                                    </>
                                ) : (
                                    <>
                                        <IconUserMinus className="w-5 h-5" />
                                        Remove
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

RemoveMemberModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    chatId: PropTypes.string,
    currentMembers: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            avatar: PropTypes.object
        })
    ),
    currentUserId: PropTypes.string,
    creatorId: PropTypes.string,
    onMembersRemoved: PropTypes.func
};

export default RemoveMemberModal;
