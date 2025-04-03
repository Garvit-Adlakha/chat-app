import React, { useState, useEffect, useRef } from 'react';
import { IconSettings, IconMoon, IconSun, IconLogout } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import userService from '../../../service/userService';
import { useNavigate } from 'react-router-dom';
import useUiStore from '../../../store/UiStore';
import toast from 'react-hot-toast';
import { useClickOutside } from '../../../hooks/UseClickOutside';

export const SettingsDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, toggleTheme } = useUiStore();
    const navigate = useNavigate();
    const settingRef = useRef(null);
    const dropdownMenuRef = useRef(null);
    const queryClient = useQueryClient();
    const logoutMutation = useMutation({
        mutationFn: userService.logout,
        onSuccess: () => {
            // Clear the user data
            queryClient.setQueryData(['user'], null);
            // Invalidate all queries to ensure clean state
            queryClient.invalidateQueries();
            toast.success("Logged out successfully");
            navigate('/');
        },
        onError: (error) => {
            console.error("Logout error:", error);
            toast.error("Failed to logout. Please try again.");
        },
    });

    const handleThemeToggle = () => {
        toggleTheme();
        setIsOpen(false);
    };

    useClickOutside(settingRef, (event) => {
        // Only close if the click is outside both the button and dropdown menu
        if (!dropdownMenuRef.current || !dropdownMenuRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    });
   
    const handleLogout = (e) => {
        e.preventDefault();
        // Stop event propagation to prevent the backdrop click handler from firing
        e.stopPropagation();
        // Just trigger the mutation and let the callbacks handle navigation
        logoutMutation.mutate();
    };

    return (
        <div className="relative z-[999]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    p-2 rounded-md
                    transition-colors
                    hover:bg-neutral-300 dark:hover:bg-neutral-800
                    text-neutral-700 dark:text-neutral-200
                `}
                aria-label="Settings"
                ref={settingRef}
            >
                <IconSettings className="w-6 h-6" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[998]"
                        onClick={() => setIsOpen(false)}
                    />
                    <div 
                        ref={dropdownMenuRef}
                        className={`
                            absolute bottom-full right-0 md:left-0 mb-2
                            w-48 py-2
                            bg-white dark:bg-neutral-800
                            rounded-lg shadow-lg
                            z-[999]
                            animate-fadeIn
                        `}
                    >
                        <button
                            onClick={handleLogout}
                            className={`
                                w-full px-4 py-2
                                flex items-center gap-2
                                text-red-600 dark:text-red-400
                                hover:bg-red-50 dark:hover:bg-red-900/20
                                transition-colors
                            `}
                        >
                            <IconLogout className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};