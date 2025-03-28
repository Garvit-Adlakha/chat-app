import React, { useState, useEffect } from 'react';
import { IconSettings, IconMoon, IconSun, IconLogout } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import userService from '../../../service/userService';
import { useNavigate } from 'react-router-dom';
import useUiStore from '../../../store/UiStore';

export const SettingsDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, toggleTheme } = useUiStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const logoutMutation = useMutation({
        mutationFn: userService.logout,
        onSuccess: () => {
            console.log("logout success");
            queryClient.setQueryData(['user'], null);
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const handleThemeToggle = () => {
        toggleTheme();
        setIsOpen(false);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        logoutMutation.mutate();
        navigate('/login');
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    p-2 rounded-md
                    transition-colors
                    hover:bg-neutral-300 dark:hover:bg-neutral-800
                    text-neutral-700 dark:text-neutral-200
                `}
                aria-label="Settings"
            >
                <IconSettings className="w-6 h-6" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className={`
                        absolute bottom-full left-0 mb-2
                        w-48 py-2
                        bg-white dark:bg-neutral-800
                        rounded-lg shadow-lg
                        z-20
                        animate-fadeIn
                    `}>
                        <button
                            onClick={handleThemeToggle}
                            className={`
                                w-full px-4 py-2
                                flex items-center gap-2
                                hover:bg-neutral-100 dark:hover:bg-neutral-700
                                transition-colors
                            `}
                        >
                            {theme === 'dark' ? (
                                <>
                                    <IconSun className="w-5 h-5" />
                                    <span>Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <IconMoon className="w-5 h-5" />
                                    <span>Dark Mode</span>
                                </>
                            )}
                        </button>

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