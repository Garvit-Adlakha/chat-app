import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, useSidebar } from "../ui/sidebar";
import { 
    IconUsers, 
    IconMessage, 
    IconHeartQuestion,
    IconUsersGroup
} from "@tabler/icons-react";
import GroupsSection from '../chat/GroupsSection';
import ProfileSection from '../profile/ProfileSection';
import DirectMessagesSection from '../chat/DirectMessagesSection';
import FriendRequestsSection from '../chat/FriendRequestsSection';
import { NavButton, SettingsDropdown, UserAvatar } from "./sidebar-components";
import { useQuery } from "@tanstack/react-query";
import userService from "../../service/userService";
import FriendsSection from "../chat/FriendsSection";
import { MobileDock } from './sidebar-components/MobileDock';

export const SideBar = () => {
    const [activeSection, setActiveSection] = useState('direct');
    const { isOpen } = useSidebar();  // Changed from open to isOpen for clarity
    const{data:request , isFetching}=useQuery({
        queryKey:["requests"],
        queryFn: userService.getAllNotifications,
        refetchInterval:10000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        
    })
    const [requestCount, setRequestCount] = useState(0);
    
    // Update requestCount whenever request data changes
    useEffect(() => {
        if (request && request.length > 0) {
            setRequestCount(request.length);
        }
    }, [request]);
    
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
            icon: IconUsersGroup,
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
                {/* Desktop Navigation Sidebar */}
                <nav 
                    className="
                        hidden md:flex flex-col items-center 
                        bg-neutral-200 dark:bg-neutral-900 
                        py-2 w-16 h-full flex-shrink-0 
                        shadow-md backdrop-blur-2xl rounded-2xl mr-2
                        relative z-[999]
                    "
                    aria-label="Main navigation"
                >
                    <UserAvatar 
                        onClick={() => setActiveSection('profile')}
                        isActive={activeSection === 'profile'}
                    />

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
                        <SettingsDropdown />
                    </div>
                </nav>

                {/* Main Content */}
                <main 
                    className="
                        flex flex-col flex-1 
                        bg-white dark:bg-neutral-800 
                        h-full pb-24 md:pb-0 overflow-hidden rounded-2xl
                        relative z-10
                    "
                    role="main"
                    aria-label={`${activeSection} section`}
                >
                    {renderContent()}
                </main>

                {/* Mobile Dock */}
                <MobileDock>
                    <UserAvatar 
                        onClick={() => setActiveSection('profile')}
                        isActive={activeSection === 'profile'}
                        size="sm"
                    />
                    {navigationItems.map(item => (
                        <NavButton
                            key={item.id}
                            {...item}
                            badge={item.badge}
                            size="sm"
                            aria-label={item.label}
                        />
                    ))}
                    <SettingsDropdown size="sm" />
                  
                </MobileDock>
            </SidebarBody>
        </Sidebar>
    );
};

