import Title from "../shared/Title";
import { SidebarProvider } from "../ui/sidebar";
import {SideBar} from "./SideBar";
import useSocketStore from "../socket/Socket";
import { useCallback, useEffect, useRef } from "react";
import { NEW_FRIEND_REQUEST, NEW_FRIEND_REQUEST_ACCEPTED, NEW_FRIEND_REQUEST_REJECTED, NEW_MESSAGE_ALERT, TYPING, STOP_TYPING, USER_STATUS_CHANGE } from "../../constants/event";
import useChatStore from "../../store/chatStore";
import SocketReconnector from '../socket/SocketReconnector';

const AppLayout = () => (WrappedComponent) => {
    const WithLayout = (props) => {
        const { socket, connect, disconnect, isConnected } = useSocketStore();
        const { updateMessageCount, messageCounts, setUserTyping, removeUserTyping, setUserOnlineStatus } = useChatStore();
        const connectedRef = useRef(false);

        // Set up socket connection
        useEffect(() => {
            if (!connectedRef.current) {
                connect();
                connectedRef.current = true;
                
                socket.on('connect', () => {
                });
            }
            
            return () => {
                if (connectedRef.current) {
                    disconnect();
                    connectedRef.current = false;
                }
            };
        }, [connect, disconnect, socket]);

        // Handle new message alerts - simplified
        const newMessageAlertHandler = useCallback((data) => {
            if (data && data.chatId) {
                // Increment the count by 1 for each new message
                const currentCount = messageCounts[data.chatId] || 0;
                updateMessageCount(data.chatId, currentCount + 1);
            }
        }, [updateMessageCount, messageCounts]);
        
        // Set up event listeners
        useEffect(() => {
            if (!socket) return;
            
            // Register message alert handler
            socket.on(NEW_MESSAGE_ALERT, newMessageAlertHandler);
            
            // Cleanup event listeners
            return () => {
                socket.off(NEW_MESSAGE_ALERT, newMessageAlertHandler);
            };
        }, [socket, newMessageAlertHandler]);

        // Handle typing events globally
        useEffect(() => {
            if (socket) {
                socket.on(TYPING, (data) => {
                    if (data.chatId && data.user) {
                        setUserTyping(data.chatId, data.user._id, data.user.name);
                    }
                });
                
                socket.on(STOP_TYPING, (data) => {
                    if (data.chatId && data.user) {
                        removeUserTyping(data.chatId, data.user._id);
                    }
                });
            }
            
            return () => {
                if (socket) {
                    socket.off(TYPING);
                    socket.off(STOP_TYPING);
                }
            };
        }, [socket, setUserTyping, removeUserTyping]);

        // Handle user status changes
        useEffect(() => {
            if (!socket) return;
            
            // Listen for user status changes
            socket.on(USER_STATUS_CHANGE, ({ userId, isOnline, lastActive }) => {
                setUserOnlineStatus(userId, isOnline, lastActive);
            });
            
            return () => {
                socket.off(USER_STATUS_CHANGE);
            };
        }, [socket, setUserOnlineStatus]);

        // Add heartbeat to keep socket connection alive
        useEffect(() => {
            if (!socket || !isConnected) return;
            
            const heartbeatInterval = setInterval(() => {
                if (socket && isConnected) {
                    socket.emit('heartbeat', { timestamp: Date.now() });
                }
            }, 30000); // Send heartbeat every 30 seconds
            
            // Set up acknowledgment listener
            socket.on('heartbeat_ack', (data) => {
            });
            
            return () => {
                clearInterval(heartbeatInterval);
                socket.off('heartbeat_ack');
            };
        }, [socket, isConnected]);

        return (
            <>
                <SocketReconnector />
                <Title />
                <div className="flex flex-col md:grid md:grid-cols-5 lg:grid-cols-4 max-h-[calc(100vh-10rem)] md:max-h-[calc(100vh-4rem)] mt-2 sm:mt-4 h-full px-2 sm:px-4">
                    <div className=" md:inline-block md:col-span-2 lg:col-span-1 h-full z-20">
                        <SidebarProvider>
                            <SideBar />
                        </SidebarProvider>
                    </div>
                    <div className="w-full md:col-span-3  h-full md:pl-3 z-10">
                        <WrappedComponent {...props} />
                    </div>
                </div>
            </>
        )
    }
    WithLayout.displayName = `WithLayout(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    return WithLayout;
}
export default AppLayout