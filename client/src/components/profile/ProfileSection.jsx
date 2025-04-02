import { useState, useEffect } from "react";
import {
    IconCamera,
    IconCircleDot,
    IconUsers,
    IconUserCircle,
} from '@tabler/icons-react';
import VisuallyHiddenInput from '../shared/VisuallyHiddenInput';
import { useMutation, useQuery } from "@tanstack/react-query";
import userService from "../../service/userService";
import PropTypes from 'prop-types';
import chatService from "../../service/chatService";
import { UserAvatar } from "../layout/sidebar-components";
import Avatar from "../shared/Avatar";
import toast from "react-hot-toast";


const ProfileSection = ({ userId = null }) => {
    // Current user query

    const { data: currentUser, isLoading: isLoadingUser } = useQuery({
        queryKey: ["user"],
        queryFn: userService.currentUser,
    });
    
    // Profile user query (either current user or other user)
    const { data: profileUser, isLoading: isLoadingProfile } = useQuery({
        queryKey: ["userProfile", userId],
        queryFn: () => userId ? userService.userProfile(userId) : userService.currentUser(),
        enabled: !!(userId || currentUser),
    });

    
    const isOnline = profileUser?.isOnline;

    // Friends query remains unchanged
    const { data: friends = [], isLoading: isLoadingFriends } = useQuery({
        queryKey: ["friends"],
        queryFn: userService.UserFriends,
    });

    const { data: groups } = useQuery({
        queryKey: ["groups"],
        queryFn: chatService.UserGroupChats
    })


    const updateMutation = useMutation({
        mutationFn: (data) => userService.updateProfile(data),
        mutationKey: ['updateProfile'],  // Add mutation key
        onMutate: () => {
            // Add loading toast
            toast.loading('Updating profile...');
        },
        onSuccess: () => {
            toast.dismiss(); // Dismiss loading toast
            toast.success("Profile updated successfully");
        },
        onError: (error) => {
            toast.dismiss(); // Dismiss loading toast
            toast.error(error?.response?.data?.message || "Failed to update profile");
        }
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({
        name: "",
        avatar: "",
        bio: "",
    });
    const [previewAvatar, setPreviewAvatar] = useState(null);

    // Check if the profile belongs to the current user
    const isCurrentUser = !userId || (currentUser?._id === userId);

    // Update editedUser when profileUser data loads
    useEffect(() => {
        if (profileUser) {
            setEditedUser({
                name: profileUser.name ,
                avatar: profileUser.avatar?.url || IconUserCircle,
                bio: profileUser.bio || "Hello, I'm using Chat App!",
            });
            setPreviewAvatar(profileUser.avatar?.url);
        }
    }, [profileUser]);

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewAvatar(reader.result);
                setEditedUser(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (!editedUser.name.trim()) {
            toast.error('Name cannot be empty');
            return;
        }

        if (updateMutation.isLoading) {
            return; // Prevent multiple submissions
        }

        const formData = new FormData();
        formData.append("name", editedUser.name.trim());
        formData.append("bio", editedUser.bio.trim());

        if (editedUser.avatar && editedUser.avatar.startsWith('data:')) {
            try {
                const dataURLtoBlob = (dataURL) => {
                    const arr = dataURL.split(',');
                    const mime = arr[0].match(/:(.*?);/)[1];
                    const bstr = atob(arr[1]);
                    const u8arr = new Uint8Array(bstr.length);
                    
                    for (let i = 0; i < bstr.length; i++) {
                        u8arr[i] = bstr.charCodeAt(i);
                    }
                    
                    return new Blob([u8arr], { type: mime });
                };

                const blob = dataURLtoBlob(editedUser.avatar);
                const file = new File([blob], "avatar.png", { type: "image/png" });
                formData.append("avatar", file);
            } catch (error) {
                toast.error('Error processing avatar image');
                return;
            }
        }

        updateMutation.mutate(formData, {
            onSuccess: () => {
                setIsEditing(false);
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || 'Failed to update profile');
            }
        });
    };

    if (isLoadingUser || isLoadingFriends || isLoadingProfile || updateMutation.isPending) {
        return (
            <div className="flex items-center justify-center min-h-[500px] w-full">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-md mx-auto">
            <div className="backdrop-blur-2xl rounded-2xl shadow-lg p-8 bg-white/50 dark:bg-neutral-800/50">
                <div className="flex flex-col items-center">
                    {/* Avatar Section */}
                    <div className="relative mb-6 group">
                        <div className="relative">
                            <Avatar
                                src={previewAvatar}
                                alt={editedUser.name}
                                className={`w-28 h-28 ring-4 ring-white dark:ring-neutral-700 shadow-lg ${
                                    isCurrentUser ? 'cursor-pointer transition-all duration-300 group-hover:scale-105' : ''
                                }`}
                                user={profileUser} // Pass the full user object to handle Google verification
                            />
                            {isEditing && isCurrentUser && (
                                <label className="absolute inset-0 cursor-pointer bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                    <IconCamera className="w-8 h-8 text-white" />
                                    <VisuallyHiddenInput
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                            )}
                            
                            {/* Display a badge for Google-verified users */}
                            {profileUser?.googleId && profileUser?.isEmailVerified && (
                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-neutral-800 rounded-full p-1 shadow-md">
                                    <img 
                                        src="/google-g-logo.svg" 
                                        alt="Google Verified" 
                                        className="w-4 h-4"
                                        title="Google Verified Account" 
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Name and Bio Section */}
                    <div className="w-full space-y-4 mb-8">
                        {isEditing && isCurrentUser ? (
                            <input
                                type="text"
                                value={editedUser.name}
                                onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
                                className="text-2xl font-bold text-center w-full bg-transparent border-b-2 border-blue-500 focus:outline-none px-2 py-1 transition-all duration-200"
                                placeholder="Your name"
                            />
                        ) : (
                            <h2 className="text-2xl font-bold text-center text-neutral-800 dark:text-neutral-200">
                                {editedUser.name}
                            </h2>
                        )}

                        {isEditing && isCurrentUser ? (
                            <textarea
                                value={editedUser.bio}
                                onChange={(e) => setEditedUser(prev => ({ ...prev, bio: e.target.value }))}
                                className="w-full p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                rows={3}
                                placeholder="Write something about yourself..."
                            />
                        ) : (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center italic px-4">
                                "{editedUser.bio}"
                            </p>
                        )}
                    </div>

                    {/* Stats Section */}
                    <div className="w-full space-y-3">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex justify-between items-center p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200">
                                <div className="flex items-center gap-3">
                                    <IconCircleDot className={`w-5 h-5 ${isOnline ? 'text-green-500' : 'text-neutral-400'}`} />
                                    <span className="text-sm font-medium">Status</span>
                                </div>
                                <span className={`text-sm font-semibold ${isOnline ? 'text-green-500' : 'text-neutral-400'}`}>
                                    {isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>

                            {isCurrentUser && (
                                <>
                                    <div className="flex justify-between items-center p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200">
                                        <div className="flex items-center gap-3">
                                            <IconUsers className="w-5 h-5 text-blue-500" />
                                            <span className="text-sm font-medium">Friends</span>
                                        </div>
                                        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                                            {friends?.length || 0}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200">
                                        <div className="flex items-center gap-3">
                                            <IconUserCircle className="w-5 h-5 text-purple-500" />
                                            <span className="text-sm font-medium">Groups</span>
                                        </div>
                                        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                                            {groups?.length || 0}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isCurrentUser && (
                        <div className="mt-8 flex gap-3 w-full">
                            <button
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                className={`flex-1 px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                                    isEditing
                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                                }`}
                            >
                                {isEditing ? 'Save Changes' : 'Edit Profile'}
                            </button>
                            {isEditing && (
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 px-6 py-2.5 rounded-xl font-medium text-sm bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

ProfileSection.propTypes = {
    userId: PropTypes.string
};

export default ProfileSection;
