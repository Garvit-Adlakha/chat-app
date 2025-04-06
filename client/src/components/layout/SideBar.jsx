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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import userService from "../../service/userService";
import FriendsSection from "../chat/FriendsSection";
import { MobileDock } from './sidebar-components/MobileDock';
import useChatStore from "../../store/chatStore";
import useSocketStore from "../socket/Socket";
import { NEW_FRIEND_REQUEST, NEW_FRIEND_REQUEST_ACCEPTED, NEW_FRIEND_REQUEST_REJECTED } from "../../constants/event";

export const SideBar = () => {
    const [activeSection, setActiveSection] = useState('direct');
    const { isOpen } = useSidebar();  // Changed from open to isOpen for clarity
    const { requestNotifications, setRequestNotifications, incrementRequestNotifications, decrementRequestNotifications } = useChatStore();
    const { socket } = useSocketStore();
    const queryClient = useQueryClient();
    
    const { data: request, isFetching, refetch: refetchRequests } = useQuery({
        queryKey: ["requests"],
        queryFn: userService.getAllNotifications,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    });

    // Update requestNotifications in the store whenever request data changes
    useEffect(() => {
        if (request) {
            // Always set the notifications count to match the actual request data
            // This ensures the badge is properly updated whether requests increase or decrease
            setRequestNotifications(request.length);
        }
    }, [request, setRequestNotifications]);

    useEffect(() => {
        if (!socket) return;

        const handleNewFriendRequest = () => {
            incrementRequestNotifications();
            refetchRequests();
        };

        const handleFriendRequestAccepted = () => {
            decrementRequestNotifications();
            refetchRequests();
        };

        const handleFriendRequestRejected = () => {
            decrementRequestNotifications();
            refetchRequests();
        };

        socket.on(NEW_FRIEND_REQUEST, handleNewFriendRequest);
        socket.on(NEW_FRIEND_REQUEST_ACCEPTED, handleFriendRequestAccepted);
        socket.on(NEW_FRIEND_REQUEST_REJECTED, handleFriendRequestRejected);

        return () => {
            socket.off(NEW_FRIEND_REQUEST, handleNewFriendRequest);
            socket.off(NEW_FRIEND_REQUEST_ACCEPTED, handleFriendRequestAccepted);
            socket.off(NEW_FRIEND_REQUEST_REJECTED, handleFriendRequestRejected);
        };
    }, [socket, incrementRequestNotifications, decrementRequestNotifications, refetchRequests]);

    const navigationItems = [
        {
            id: 'direct',
            icon: IconMessage,
            label: 'Direct Messages',
            tooltip: 'Direct Messages',
            isActive: activeSection === 'direct',
            onClick: () => setActiveSection('direct')
        },
        {
            id: 'groups',
            icon: IconUsersGroup,
            label: 'Groups',
            tooltip: 'Group Chats',
            isActive: activeSection === 'groups',
            onClick: () => setActiveSection('groups')
        },
        {
            id: 'Friends',
            icon: IconUsers,
            label: 'Friends',
            tooltip: 'Your Friends',
            isActive: activeSection === 'friends',
            onClick: () => setActiveSection('friends')
        },
        {
            id: 'requests',
            icon: IconHeartQuestion,
            label: 'Requests',
            tooltip: 'Friend Requests',
            isActive: activeSection === 'requests',
            onClick: () => setActiveSection('requests'),
            badge: requestNotifications > 0 ? requestNotifications : null
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
                                    tooltip={item.tooltip}
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
                            tooltip={item.tooltip}
                        />
                    ))}
                    <SettingsDropdown size="sm" />
                  
                </MobileDock>
            </SidebarBody>
        </Sidebar>
    );
};

