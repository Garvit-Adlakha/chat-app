import React, { useState } from "react";
import { Sidebar, SidebarBody, useSidebar } from "../ui/sidebar";
import { motion } from "framer-motion";
import { IconUsers, IconMessage, IconSettings, IconSearch, IconHeartQuestion, IconHandLoveYou ,IconUsersPlus,IconLogout2,IconSettingsSpark,IconAdjustments} from "@tabler/icons-react";

interface Group {
    id: string;
    name: string;
    icon: React.ReactNode;
}

interface User {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
}

const mockCurrentUser = {
    id: "user1",
    name: "John Doe",
    avatar: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
};

const mockGroups = [
    { id: "group1", name: "Team Alpha", icon: "🚀" },
    { id: "group2", name: "Project Beta", icon: "🔬" },
    { id: "group3", name: "Gaming Squad", icon: "🎮" }
];

const mockFriends = [
    { id: "friend1", name: "Alice Smith", avatar: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp", online: true },
    { id: "friend2", name: "Bob Johnson", avatar: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp", online: false },
    { id: "friend3", name: "Carol Williams", avatar: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp", online: true }
];

const Avatar = ({ src, alt, className }) => (
    <img src={src} alt={alt} className={`rounded-full object-cover ${className}`} />
);

const Search = ({ placeholder, value, onChange }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <IconSearch className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
        </div>
        <input
            type="text"
            className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 transition-colors"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    </div>
);

export const SideBar = () => {
    const currentUser = mockCurrentUser

    const groups = mockGroups;
    const friends = mockFriends;
    const [isDirect, setIsDirect] = useState(false);
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isRequest, setIsRequest] = useState(false);
    const [requestCount, setRequestCount] = useState(3); // Example initial count
    const { open } = useSidebar();

    const toggleLogin = () => {
        setIsLoggedIn(!isLoggedIn);
    };
    const handleRequestClick = () => {
        setIsRequest(!isRequest);
        setRequestCount(0); // Reset count when viewing requests
    };
    const IsDirectClickHandler = () => {
    setIsDirect(true);
    setIsRequest(false);
    }

    const isUserChatClickHandler = () => {
        setIsDirect(false);
        setIsRequest(false);
    }
    return (
        <Sidebar>
            <SidebarBody className="flex flex-col p-0 shadow min-w-full h-full rounded-2xl">
                <div className="bg-neutral-200 dark:bg-neutral-900 flex flex-col items-center py-6 w-16 h-full flex-shrink-0 shadow-md backdrop-blur-2xl rounded-2xl mr-2">
                    <div className="mb-8 relative">
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
                {isDirect && !isRequest ? (
                        <DirectMessagesSection friends={friends} showOnlineOnly={showOnlineOnly} setShowOnlineOnly={setShowOnlineOnly} />
                    ) : !isRequest ?(
                        <GroupsSection groups={groups} />
                    ) : (
                        <FriendRequestsSection />
                    )
                }
                </main>
            </SidebarBody>
        </Sidebar>
    );
};

const FriendRequestsSection = () => {
    return (
        <div className="flex-1 flex flex-col justify-center items-center">
            <IconHandLoveYou className="w-16 h-16 text-neutral-500 dark:text-neutral-400" />
            <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mt-4">No friend requests</h3>
        </div>
    );
}

const DirectMessagesSection = ({ friends, showOnlineOnly, setShowOnlineOnly }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFriends = friends.filter(friend =>
        (!showOnlineOnly || friend.online) &&
        friend.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className=" border-neutral-200 dark:border-neutral-700">
                <Search
                    placeholder="Search friends..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="px-4 py-3 flex items-center border-b border-neutral-200 dark:border-neutral-700">
                <label className="inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showOnlineOnly}
                        onChange={() => setShowOnlineOnly(!showOnlineOnly)}
                        className="toggle "
                    />
                    <span className="ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Online only
            </span>
                </label>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                    {showOnlineOnly ? "Online Friends" : "All Friends"}
                </h3>
                <div className="space-y-2">
                    {filteredFriends.length > 0 ? (
                        filteredFriends.map(friend => (
                            <div key={friend.id} className="flex items-center p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer">
                                <Avatar src={friend.avatar} alt={friend.name} className="w-10 h-10 mr-3" />
                                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {friend.name}
                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">No friends found.</p>
                    )}
                </div>
            </div>
        </>
    );
};

const GroupsSection = ({ groups }) => {
    const[searchQuery, setSearchQuery] = useState('');
    const handleCreateGroup = () => {
        // In a real app, this would open a modal or navigate to group creation page
        // For now, we'll just show an alert
        alert("Create Group functionality will be implemented here");
        
        // Typical implementation would:
        // 1. Open a modal with group creation form
        // 2. Collect group name, icon, and member information
        // 3. Make API call to create group
        // 4. Update the groups list with the new group
    };

    return (
        <div className="overflow-y-auto flex-1">
            <div className="border-b border-neutral-200 dark:border-neutral-700">

            <div className="pb-2  border-neutral-200 dark:border-neutral-700 ">
                <Search
                    placeholder="Search friends..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    />
            </div>
            <div className="p-2">
                <button className="w-full btn bg-black/50 rounded-lg cursor-pointer" 
                    onClick={handleCreateGroup}
                >
                    <IconUsersPlus />
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Create new Group</span>
            </button>
            </div>
            </div>
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">Groups</h3>
            <div className="space-y-2">
                {groups.map(group => (
                    <div key={group.id} className="flex items-center p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer">
                        <span className="text-xl mr-3">{group.icon}</span>
                        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{group.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};