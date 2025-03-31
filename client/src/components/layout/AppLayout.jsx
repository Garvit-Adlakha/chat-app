import Title from "../shared/Title";
import { SidebarProvider } from "../ui/sidebar";
import {SideBar} from "./SideBar";
import useSocketStore from "../socket/Socket";
import { useCallback, useEffect, useRef } from "react";
import { NEW_FRIEND_REQUEST, NEW_FRIEND_REQUEST_ACCEPTED, NEW_FRIEND_REQUEST_REJECTED, NEW_MESSAGE_ALERT, TYPING, STOP_TYPING } from "../../constants/event";
import useChatStore from "../../store/chatStore";

const AppLayout = () => (WrappedComponent) => {
    const WithLayout = (props) => {
        const { socket, connect, disconnect } = useSocketStore();
        const { updateMessageCount, messageCounts, setUserTyping, removeUserTyping } = useChatStore();
        const connectedRef = useRef(false);

        // Set up socket connection
        useEffect(() => {
            if (!connectedRef.current) {
                connect();
                connectedRef.current = true;
                
                socket.on('connect', () => {
                    console.log('Socket connected:', socket.id);
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

        return (
            <>
                <Title />
                <div className="flex flex-col md:grid md:grid-cols-4 max-h-[calc(100vh-4rem)] mt-2 sm:mt-4 h-full px-2 sm:px-4">
                    <div className="hidden md:inline-block md:col-span-1 h-full">
                        <SidebarProvider>
                            <SideBar />
                        </SidebarProvider>
                    </div>
                    <div className="w-full md:col-span-3 h-full md:pl-3">
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