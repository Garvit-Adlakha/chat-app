import React, { useState } from "react";
import { Sidebar, SidebarBody, useSidebar } from "../ui/sidebar";
import { IconProps } from "@tabler/icons-react";
import { 
    IconUsers, 
    IconMessage, 
    IconSettings, 
    IconHeartQuestion
} from "@tabler/icons-react";
import GroupsSection from '../chat/GroupsSection';
import ProfileSection from '../profile/ProfileSection';
import DirectMessagesSection from '../chat/DirectMessagesSection';
import FriendRequestsSection from '../chat/FriendRequestsSection';
import { NavButton, SettingsDropdown, UserAvatar } from "./sidebar-components";
import { mockGroups, mockCurrentUser, mockFriends } from "../../mocks/data";

// Define types
type ActiveSection = 'direct' | 'groups' | 'requests' | 'profile';

interface NavigationItem {
    id: ActiveSection;
    icon: React.FC<IconProps>;
    label: string;
    isActive: boolean;
    onClick: () => void;
    badge?: number;
}

export const SideBar: React.FC = () => {
    const [activeSection, setActiveSection] = useState<ActiveSection>('groups');
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [requestCount, setRequestCount] = useState(3);
    const { isOpen } = useSidebar();  // Changed from open to isOpen for clarity

    const navigationItems: NavigationItem[] = [
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
            case 'direct':
                return (
                    <DirectMessagesSection 
                        friends={mockFriends} 
                        showOnlineOnly={showOnlineOnly}
                        setShowOnlineOnly={setShowOnlineOnly}
                    />
                );
            case 'requests':
                return <FriendRequestsSection />;
            default:
                return <GroupsSection groups={mockGroups} />;
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
                        py-3 w-16 h-full flex-shrink-0 
                        shadow-md backdrop-blur-2xl rounded-2xl mr-2
                    "
                    aria-label="Main navigation"
                >
                    {/* User Avatar */}
                    <UserAvatar 
                        user={mockCurrentUser}
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

