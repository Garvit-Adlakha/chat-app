import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useChatStore = create(
    persist(
        (set, get) => ({
            // Simple object to track message counts by chat ID
            messageCounts: {},
            
            // Function to update message count for a chat
            updateMessageCount: (chatId, count) => {
                set((state) => ({
                    messageCounts: {
                        ...state.messageCounts,
                        [chatId]: count
                    }
                }));
            },
            
            // Function to clear message count for a chat
            clearMessageCount: (chatId) => {
                set((state) => {
                    const newCounts = { ...state.messageCounts };
                    delete newCounts[chatId];
                    return { messageCounts: newCounts };
                });
            },

            // Track typing status for each chat
            typingUsers: {}, // { chatId: { userId: username } }
            
            // Add typing user to a specific chat
            setUserTyping: (chatId, userId, username) => 
                set((state) => ({
                    typingUsers: {
                        ...state.typingUsers,
                        [chatId]: {
                            ...state.typingUsers[chatId],
                            [userId]: username
                        }
                    }
                })),
            
            // Remove typing user from a specific chat
            removeUserTyping: (chatId, userId) => 
                set((state) => {
                    const chatTypers = { ...state.typingUsers[chatId] };
                    delete chatTypers[userId];
                    
                    return {
                        typingUsers: {
                            ...state.typingUsers,
                            [chatId]: chatTypers
                        }
                    };
                }),
                
            // Clear all typing indicators for a chat
            clearTypingForChat: (chatId) =>
                set((state) => {
                    const updatedTypingUsers = { ...state.typingUsers };
                    delete updatedTypingUsers[chatId];
                    
                    return {
                        typingUsers: updatedTypingUsers
                    };
                }),

            // Online Status Management
            onlineUsers: {}, // { userId: { isOnline, lastActive } }
            
            // Update user online status
            setUserOnlineStatus: (userId, isOnline, lastActive) => 
                set((state) => ({
                    onlineUsers: {
                        ...state.onlineUsers,
                        [userId]: { isOnline, lastActive: lastActive || new Date() }
                    }
                })),
            
            // Check if a user is online
            isUserOnline: (userId) => {
                const state = get();
                return state.onlineUsers[userId]?.isOnline || false;
            },
            
            // Get user's last active time
            getUserLastActive: (userId) => {
                const state = get();
                return state.onlineUsers[userId]?.lastActive || null;
            }
        }),
        {
            name: 'chat-store',
            partialize: (state) => ({
                messageCounts: state.messageCounts,
                onlineUsers: state.onlineUsers
            })
        }
    )
);

export default useChatStore;