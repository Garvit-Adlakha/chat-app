import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
    IconUserPlus,
    IconUsers,
    IconCalendar,
    IconInfoCircle,
    IconX,
    IconPencil,
    IconUser,
    IconUserMinus,
    IconTrash
} from '@tabler/icons-react';
import Avatar from '../shared/Avatar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import userService from '../../service/userService';
import ProfileSection from './ProfileSection';
import AddMemberModal from '../chat/AddMemberModal';
import toast from 'react-hot-toast';
import chatService from '../../service/chatService';
import RemoveMemberModal from '../chat/RemoveMemberModal';

const ChatProfile = ({ chat, isOpen, onClose }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [chatInfo, setChatInfo] = useState({
        name: '',
        description: '',
        members: []
    });
    const [addMemberModal, setAddMemberModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [removeMemberModal, setRemoveMemberModal] = useState(false);

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: userService.currentUser
    });
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const clickHandler = (id) => {
        setSelectedUserId(id);
    };

    const deleteChatMutation = useMutation({
        mutationFn: async (chatId) => {
            console.log('Sending delete request for chat ID:', chatId);
            try {
                const response = await chatService.deleteGroup(chatId);
                console.log('Delete response:', response);
                return response;
            } catch (error) {
                console.error('Delete request failed:', error);
                throw error;
            }
        },
        onSuccess: (data) => {
            console.log('Delete mutation succeeded:', data);
            toast.success('Group deleted successfully');
            queryClient.invalidateQueries(['chats']);
            queryClient.invalidateQueries(['groups']);
            onClose();
            navigate('/chat'); // Navigate back to main chat page
        },
        onError: (error) => {
            console.error('Error deleting group:', error);
            const errorMessage = error.response?.data?.message || 
                                'Failed to delete group. Please try again later.';
            toast.error(errorMessage);
        }
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
    const handlerAddMember = () => {
        setAddMemberModal(true);
    };
    const handleCloseAddMember = () => {
        setAddMemberModal(false);
        // Invalidate chat queries to refresh data
        queryClient.invalidateQueries(['chats']);
    };
    
    const handleRemoveMembers = () => {
        console.log('Remove members clicked for chat:', chat?._id);
        setRemoveMemberModal(true);
    };
    
    const handleCloseRemoveMember = () => {
        setRemoveMemberModal(false);
        // Invalidate chat queries to refresh data
        queryClient.invalidateQueries(['chats']);
    };
    
    const handleDeleteGroup = () => {
        setShowDeleteConfirm(true);
    };
    
    const confirmDelete = () => {
        console.log('Deleting group with ID:', chat?._id);
        if (!chat?._id) {
            toast.error('Invalid chat ID');
            return;
        }
        
        deleteChatMutation.mutate(chat._id);
        setShowDeleteConfirm(false);
    };
    
    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const creatorId = chat?.isGroupChat ? chat?.creator : null
    const creator = chat?.isGroupChat ? chat?.members.find(member => member._id === creatorId) : null

    const otherMember = !chat?.isGroupChat ?
        chat?.members.find(member => member._id !== user?._id) :
        null;

    if (selectedUserId) {
        return (
            <dialog open className="modal modal-open backdrop-blur-sm bg-black z-50">
                <div className="modal-box w-full max-w-md">
                    <button
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-70"
                        onClick={() => setSelectedUserId(null)}
                    >
                        <IconX className="w-5 h-5" />
                    </button>
                    <ProfileSection userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
                </div>
            </dialog>
        );
    }

    return (
        <>
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
                                        <div className="w-24 rounded-full bg-neutral-200 dark:bg-neutral-700 mx-auto">
                                            <Avatar src={chat.groupIcon?.url} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="avatar mx-auto">
                                        <div className="w-24 rounded-full ring ring-primary ring-offset-2">
                                            <Avatar
                                                src={otherMember?.avatar}
                                                alt={otherMember?.name}
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
                                        {chat?.isGroupChat ? chatInfo.name : otherMember?.name}
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

                            {chat?.isGroupChat && (
                                <article>
                                    <div className='card bg-base-200'>
                                        <div className="card-body p-3 flex-row items-center">
                                            <IconUser className="w-5 h-5 text-blue-500" />
                                            <div>
                                                <h4 className="text-sm font-medium">Created By</h4>
                                                <p className="text-sm opacity-70">
                                                    {creator?.name || 'Unknown'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            )}
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

                            {chat?.isGroupChat && (
                                <>
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

                                    {/* Members List */}
                                    <div className="px-4 mt-4 pb-20">
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
                                                    onClick={() => clickHandler(member._id)}
                                                >
                                                    <Avatar
                                                        src={member.avatar}
                                                        alt={member.name}
                                                        className="w-8 h-8"
                                                    />
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium">
                                                            {member.name}
                                                        </p>

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Button - Fixed at bottom */}
                    {chat?.isGroupChat && chat?.creator === user._id && (
                        <div className="
                            p-4
                            bg-white/80 dark:bg-neutral-800/80
                            backdrop-blur-md
                            border-t border-neutral-200 dark:border-neutral-700
                            flex flex-col gap-2
                        ">
                            <button
                                className="btn btn-primary w-full gap-2 hover:bg-primary-focus transition-colors"
                                onClick={() => handlerAddMember()}
                            >
                                <IconUserPlus className="w-5 h-5" />
                                Add Participants
                            </button>
                            
                            <button
                                className="btn bg-amber-500 hover:bg-amber-600 text-white w-full gap-2 border-none transition-colors"
                                onClick={handleRemoveMembers}
                            >
                                <IconUserMinus className="w-5 h-5" />
                                Remove Members
                            </button>
                            
                            <button
                                className="btn bg-red-500 hover:bg-red-600 text-white w-full gap-2 border-none transition-colors"
                                onClick={handleDeleteGroup}
                                disabled={deleteChatMutation.isPending}
                            >
                                {deleteChatMutation.isPending ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <IconTrash className="w-5 h-5" />
                                        Delete Group
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </dialog>
            
            {/* Delete Confirmation Modal */}
            <dialog 
                className={`modal ${showDeleteConfirm ? 'modal-open' : ''} z-[60]`}
            >
                <div className="modal-box bg-white dark:bg-neutral-800 p-6 max-w-md mx-auto rounded-xl shadow-2xl">
                    <h3 className="font-bold text-lg text-center mb-2">Delete Group</h3>
                    <div className="divider my-1"></div>
                    <p className="py-4 text-center">
                        Are you sure you want to delete <span className="font-semibold text-error">{chat?.name}</span>?
                        <br/>
                        <span className="text-sm opacity-80 mt-2 block">
                            This action cannot be undone and all messages will be permanently deleted.
                        </span>
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <button 
                            className="btn btn-outline border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 min-w-[100px]"
                            onClick={cancelDelete}
                        >
                            Cancel
                        </button>
                        <button 
                            className="btn bg-red-500 hover:bg-red-600 text-white border-none min-w-[100px]"
                            onClick={confirmDelete}
                            disabled={deleteChatMutation.isPending}
                        >
                            {deleteChatMutation.isPending ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={cancelDelete}>close</button>
                </form>
            </dialog>
            
            <AddMemberModal
                isOpen={addMemberModal}
                onClose={handleCloseAddMember}
                chatId={chat?._id}
                currentMembers={chat?.members || []}
                onMemberAdded={() => queryClient.invalidateQueries(['chats'])}
            />
            
            <RemoveMemberModal
                isOpen={removeMemberModal}
                onClose={handleCloseRemoveMember}
                chatId={chat?._id}
                currentMembers={chat?.members || []}
                currentUserId={user?._id}
                creatorId={chat?.creator}
                onMembersRemoved={() => queryClient.invalidateQueries(['chats'])}
            />
        </>
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