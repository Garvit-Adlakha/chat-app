import React, { useState } from "react";
import { Sidebar, SidebarBody, useSidebar } from "../ui/sidebar";
import { 
    IconUsers, 
    IconMessage, 
    IconSettings, 
    IconHeartQuestion,
    IconLogout2,
    IconSettingsSpark,
    IconAdjustments
} from "@tabler/icons-react";

// Import components from correct paths
import ProfileSection from "../profile/ProfileSection";
import DirectMessagesSection from "../chat/DirectMessagesSection";
import FriendRequestsSection from "../chat/FriendRequestsSection";
import GroupsSection from "../chat/GroupsSection";
import Avatar from "../shared/Avatar";

// Move mock data to a separate file (optional)
import { mockGroups, mockCurrentUser, mockFriends } from "../../mocks/data";

export const SideBar = () => {
    const currentUser = mockCurrentUser

    const groups = mockGroups;
    const friends = mockFriends;
    const [isDirect, setIsDirect] = useState(false);
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isRequest, setIsRequest] = useState(false);
    const [requestCount, setRequestCount] = useState(3); // Example initial count
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { open } = useSidebar();

    const handleRequestClick = () => {
        setIsRequest(!isRequest);
        setRequestCount(0); // Reset count when viewing requests
        setIsProfileOpen(false);
    };
    const IsDirectClickHandler = () => {
    setIsDirect(true);
    setIsRequest(false);
    setIsProfileOpen(false);
    }

    const isUserChatClickHandler = () => {
        setIsDirect(false);
        setIsRequest(false);
        setIsProfileOpen(false);
    }
    const ProfileSectionHandler = () => {
       setIsProfileOpen(true);
    }

    return (
        <Sidebar>
            <SidebarBody className="flex flex-col p-0 shadow min-w-full h-full rounded-2xl">

                <div className="bg-neutral-200 dark:bg-neutral-900 flex flex-col items-center py-6 w-16 h-full flex-shrink-0 shadow-md backdrop-blur-2xl rounded-2xl mr-2">
                    <div className="mb-8 relative" 
                        onClick={ProfileSectionHandler}
                    >
                        <Avatar
                            src={currentUser?.avatar}
                            alt={currentUser?.name || "User"}
                            className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                       />
                    
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-neutral-200 dark:border-neutral-900 rounded-full"></div>
                    </div>

                    <div className="flex flex-col h-full justify-between">
                        <div className="flex flex-col items-center gap-5">
                            <button
                                className={`p-2 rounded-md cursor-pointer transition-colors ${
                                    isDirect && !isRequest ? 'bg-blue-500 text-white' : 'bg-transparent hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
                                }`}
                                onClick={IsDirectClickHandler}
                                aria-label="Direct Messages"
                            >
                                <IconMessage className="w-6 h-6" />
                            </button>

                            <button
                                className={`p-2 rounded-md cursor-pointer transition-colors ${
                                    !isDirect && !isRequest ? 'bg-blue-500 text-white' : 'bg-transparent hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
                                }`}                                
                                onClick={isUserChatClickHandler}
                                aria-label="Groups"
                            >
                                <IconUsers className="w-6 h-6" />
                            </button>

                            <button
                                className={`p-2 rounded-md cursor-pointer transition-colors relative ${
                                    isRequest ? 'bg-blue-500 text-white' : 'bg-transparent hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
                                }`}
                                onClick={handleRequestClick}
                                aria-label="Friend Requests"
                            >
                                <IconHeartQuestion className="w-6 h-6" />
                                {requestCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {requestCount}
                    </span>
                                )}
                            </button>                           
                        </div>

                        <div className="relative">
                            <div className="relative">
                                <button
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                    className="p-2 rounded-md cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors mb-4"
                                    aria-label="Settings"
                                >
                                    <IconSettings className="w-6 h-6" />
                                </button>
                                {isSettingsOpen && (
                                    <div className="absolute left-7 bottom-10 mb-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
                                        <div className="py-2">
                                            <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700">
                                            <span>
                                                    <IconSettingsSpark className="inline p-1"/> Profile Settings
                                                </span>  
                                            </button>
                                            <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700">
                                                <span>
                                                    <IconAdjustments className="inline p-1"/> Account Settings
                                                </span>
                                            </button>
                                            <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700">
                                                <span>
                                                    <IconLogout2 className="inline p-1"/> Logout
                                                </span>  
                                                
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <main className="flex flex-col flex-1 bg-white dark:bg-neutral-800 h-full">
                    {isProfileOpen ? (
                        <ProfileSection />
                    ) : isDirect ? (
                        <DirectMessagesSection 
                            friends={friends} 
                            showOnlineOnly={showOnlineOnly} 
                            setShowOnlineOnly={setShowOnlineOnly} 
                        />
                    ) : isRequest ? (
                        <FriendRequestsSection />
                    ) : (
                        <GroupsSection groups={groups} />
                    )}
                </main>
            </SidebarBody>
        </Sidebar>
    );
};

