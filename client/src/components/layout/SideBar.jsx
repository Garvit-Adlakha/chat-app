import React, { useState } from "react";
import { Sidebar, SidebarBody, useSidebar } from "../ui/sidebar";
import { 
    IconUsers, 
    IconMessage, 
    IconHeartQuestion
} from "@tabler/icons-react";
import GroupsSection from '../chat/GroupsSection';
import ProfileSection from '../profile/ProfileSection';
import DirectMessagesSection from '../chat/DirectMessagesSection';
import FriendRequestsSection from '../chat/FriendRequestsSection';
import { NavButton, SettingsDropdown, UserAvatar } from "./sidebar-components";
import { mockGroups } from "../../mocks/data";
import { useQuery } from "@tanstack/react-query";
import userService from "../../service/userService";
import FriendsSection from "../chat/FriendsSection";
    

export const SideBar = () => {
    const [activeSection, setActiveSection] = useState('direct');
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const { isOpen } = useSidebar();  // Changed from open to isOpen for clarity
    const{data:request}=useQuery({
        queryKey:["requests"],
        queryFn: userService.getAllNotifications
    })
    const [requestCount, setRequestCount] = useState(request?.length || 0);
    const navigationItems= [
        {
            id: 'direct',
            icon: IconMessage,
            label: 'Direct Messages',
            isActive: activeSection === 'direct',
            onClick: () => setActiveSection('direct')
        },
        {
            id: 'groups',
            icon: IconUsers,
            label: 'Groups',
            isActive: activeSection === 'groups',
            onClick: () => setActiveSection('groups')
        },
        {
            id:'Friends',
            icon: IconUsers,
            label: 'Friends',
            isActive: activeSection === 'friends',
            onClick: () => setActiveSection('friends')
        },
        {
            id: 'requests',
            icon: IconHeartQuestion,
            label: 'Friend Requests',
            isActive: activeSection === 'requests',
            onClick: () => {
                setActiveSection('requests');
                setRequestCount(0);
            },
            badge: requestCount
        }
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return <ProfileSection />;
            case 'friends':
                return <FriendsSection />
            case 'direct':
                return (
                    <DirectMessagesSection />
                );
            case 'requests':
                return <FriendRequestsSection />;
            default:
                return <GroupsSection />;
        }
    };

    return (
        <Sidebar>
            <SidebarBody className="flex flex-col p-0 min-w-full h-full rounded-2xl">
                {/* Navigation Sidebar */}
                <nav 
                    className="
                        bg-neutral-200 dark:bg-neutral-900 
                        flex flex-col items-center 
                        py-2 w-16 h-full flex-shrink-0 
                        shadow-md backdrop-blur-2xl rounded-2xl mr-2
                    "
                    aria-label="Main navigation"
                >
                    {/* User Avatar */}
                    <UserAvatar 
                        onClick={() => setActiveSection('profile')}
                        isActive={activeSection === 'profile'}
                    />

                    {/* Navigation Buttons */}
                    <div className="flex flex-col h-full justify-between">
                        <div className="flex flex-col items-center gap-5">
                            {navigationItems.map(item => (
                                <NavButton
                                    key={item.id}
                                    {...item}
                                    badge={item.badge}
                                    aria-label={item.label}
                                />
                            ))}
                        </div>

                        {/* Settings */}
                        <SettingsDropdown />
                    </div>
                </nav>

                {/* Main Content */}
                <main 
                    className="
                        flex flex-col flex-1 
                        bg-white dark:bg-neutral-800 
                        h-full overflow-hidden rounded-2xl
                    "
                    role="main"
                    aria-label={`${activeSection} section`}
                >
                    {renderContent()}
                </main>
            </SidebarBody>
        </Sidebar>
    );
};

