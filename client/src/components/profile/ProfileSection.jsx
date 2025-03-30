import { useState, useEffect } from "react";
import {
    IconCamera,
    IconCircleDot,
    IconUsers,
    IconUserCircle,
} from '@tabler/icons-react';
import Avatar from '../shared/Avatar';
import VisuallyHiddenInput from '../shared/VisuallyHiddenInput';
import { useQuery } from "@tanstack/react-query";
import userService from "../../service/userService";
import PropTypes from 'prop-types';
import chatService from "../../service/chatService";


const ProfileSection = ({ userId = null }) => {
    // Current user query
    const {data: currentUser, isLoading: isLoadingUser} = useQuery({
        queryKey: ["user"],
        queryFn: userService.currentUser,
    });

    // Profile user query (either current user or other user)
    const {data: profileUser, isLoading: isLoadingProfile} = useQuery({
        queryKey: ["userProfile", userId],
        queryFn: () => userId ? userService.userProfile(userId) : userService.currentUser(),
        enabled: !!(userId || currentUser),
    });

    // Friends query remains unchanged
    const {data: friends = [], isLoading: isLoadingFriends} = useQuery({
        queryKey: ["friends"],
        queryFn: userService.UserFriends,
    });

    const{data:groups}=useQuery({
        queryKey:["groups"],
        queryFn:chatService.UserGroupChats
    })
    console.log("groups response from profile section",groups)

    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({
        name: "",
        avatar: "",
        bio: "",
    });
    const [previewAvatar, setPreviewAvatar] = useState("");

    // Check if the profile belongs to the current user
    const isCurrentUser = !userId || (currentUser?._id === userId);

    // Update editedUser when profileUser data loads
    useEffect(() => {
        if (profileUser) {
            setEditedUser({
                name: profileUser.name || "",
                avatar: profileUser.avatar?.url || "",
                bio: profileUser.bio || "Hello, I'm using Chat App!",
            });
            setPreviewAvatar(profileUser.avatar?.url || "");
        }
    }, [profileUser]);

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewAvatar(reader.result );
                setEditedUser(prev => ({...prev, avatar: reader.result}));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        // TODO: Implement save logic with API call
        setIsEditing(false);
    };

    if (isLoadingUser || isLoadingFriends || isLoadingProfile) {
        return <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>;
    }

    return (
        <div className="p-4 max-w-md mx-auto">
            <div className=" backdrop-blur-2xl rounded-xl shadow-lg p-6">
                <div className="flex flex-col items-center">
                    {/* Avatar Section */}
                    <div className="relative mb-4 group">
                        <div className="relative">
                            <Avatar
                                src={previewAvatar}
                                alt={editedUser.name}
                                className={`w-24 h-24 ${isCurrentUser ? 'cursor-pointer transition-transform duration-200 group-hover:scale-105' : ''}`}
                            />
                            {isEditing && isCurrentUser && (
                                <label className="absolute inset-0 cursor-pointer bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                    <IconCamera className="w-8 h-8 text-white" />
                                    <VisuallyHiddenInput 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                            )}
                            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-3 border-white dark:border-neutral-800 rounded-full ring-2 ring-white dark:ring-neutral-800"></div>
                        </div>
                    </div>

                    {/* Name Section */}
                    <div className="w-full mb-4">
                        {isEditing && isCurrentUser ? (
                            <input
                                type="text"
                                value={editedUser.name}
                                onChange={(e) => setEditedUser(prev => ({...prev, name: e.target.value}))}
                                className="text-xl font-bold text-center w-full bg-transparent border-b-2 border-blue-500 focus:outline-none px-2 py-1 transition-all duration-200"
                                placeholder="Your name"
                            />
                        ) : (
                            <h2 className="text-xl font-bold text-center text-neutral-800 dark:text-neutral-200">
                                {editedUser.name}
                            </h2>
                        )}
                    </div>

                    {/* Bio Section */}
                    <div className="w-full mb-6">
                        {isEditing && isCurrentUser ? (
                            <textarea
                                value={editedUser.bio}
                                onChange={(e) => setEditedUser(prev => ({...prev, bio: e.target.value}))}
                                className="w-full p-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                rows={3}
                                placeholder="Write something about yourself..."
                            />
                        ) : (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center italic">
                                "{editedUser.bio}"
                            </p>
                        )}
                    </div>

                    {/* Stats Section */}
                    <div className="w-full space-y-3">
                        <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <IconCircleDot className="w-5 h-5 text-green-500" />
                                <span className="text-sm font-medium">Status</span>
                            </div>
                            <span className="text-sm font-semibold text-green-500">Online</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <IconUsers className="w-5 h-5 text-blue-500" />
                                <span className="text-sm font-medium">Friends</span>
                            </div>
                            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                                {friends?.length || 0}
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <IconUserCircle className="w-5 h-5 text-purple-500" />
                                <span className="text-sm font-medium">Groups</span>
                            </div>
                            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                                {groups?.length}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons - Only show for current user */}
                    {isCurrentUser && (
                        <div className="mt-6 flex gap-3">
                            <button 
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
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
                                    className="px-6 py-2 rounded-lg font-medium text-sm bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-all duration-200"
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
