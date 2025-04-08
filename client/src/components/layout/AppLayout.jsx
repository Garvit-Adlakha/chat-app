import Title from "../shared/Title";
import { SidebarProvider } from "../ui/sidebar";
import {SideBar} from "./SideBar";
import useSocketStore from "../socket/Socket";
import { useCallback, useEffect, useRef } from "react";
import { NEW_FRIEND_REQUEST, NEW_FRIEND_REQUEST_ACCEPTED, NEW_FRIEND_REQUEST_REJECTED, NEW_MESSAGE_ALERT, TYPING, STOP_TYPING, USER_STATUS_CHANGE, GET_ONLINE_USERS } from "../../constants/event";
import useChatStore from "../../store/chatStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import userService from "../../service/userService";

const AppLayout = () => (WrappedComponent) => {
    const WithLayout = (props) => {
        const { socket, connect, disconnect } = useSocketStore();
        const { 
            updateMessageCount, 
            messageCounts, 
            setUserTyping, 
            removeUserTyping, 
            setUserOnlineStatus,
            setMultipleUsersOnlineStatus,
            resetAllUsersOffline,
            incrementRequestNotifications,
            decrementRequestNotifications,
            setRequestNotifications
        } = useChatStore();
        const connectedRef = useRef(false);
        const queryClient = useQueryClient();

        // Fetch friends list to know which users should show online status
        const { data: friends = [] } = useQuery({
            queryKey: ["friends"],
            queryFn: userService.UserFriends,
            enabled: !!socket // Only fetch when socket is available
        });

        // Fetch friend requests to set initial notification count
        const { data: requests = [], refetch: refetchRequests } = useQuery({
            queryKey: ["requests"],
            queryFn: userService.getAllNotifications,
            enabled: !!socket,
            onSuccess: (data) => {
                // Set the notifications count based on actual request data
                setRequestNotifications(data.length);
            }
        });

        // Set up socket connection - only once on mount
        useEffect(() => {
            if (!connectedRef.current) {
                connect();
                connectedRef.current = true;
            }
            
            return () => {
                if (connectedRef.current) {
                    disconnect();
                    connectedRef.current = false;
                }
            };
        }, []); // Empty dependency array - run only on mount/unmount

        // Handle socket events - separate from connection logic
        useEffect(() => {
            if (!socket) return;
                
            const handleConnect = () => {
                // When connected, get online status for friends only
                socket.emit(GET_ONLINE_USERS, (response) => {
                    if (response && response.users) {
                        const onlineStatusMap = {};
                        const friendIds = new Set(friends.map(friend => friend._id));
                        
                        // Only show online status for users who are friends
                        response.users.forEach(user => {
                            if (friendIds.has(user.userId)) {
                                onlineStatusMap[user.userId] = {
                                    isOnline: true,
                                    lastActive: new Date()
                                };
                            }
                        });
                        
                        setMultipleUsersOnlineStatus(onlineStatusMap);
                    }
                });
            };
            
            const handleDisconnect = () => {
                // When socket disconnects, mark all users as offline
                resetAllUsersOffline();
            };
            
            socket.on('connect', handleConnect);
            socket.on('disconnect', handleDisconnect);
            
            return () => {
                socket.off('connect', handleConnect);
                socket.off('disconnect', handleDisconnect);
            };
        }, [socket, friends, setMultipleUsersOnlineStatus, resetAllUsersOffline]);

        const newRequestHandler = useCallback(() => {
            // Increment the request notification count when a new request is received
            incrementRequestNotifications();
            // Actively refetch the requests data rather than just invalidating
            refetchRequests();
            // Also invalidate other related queries
            queryClient.invalidateQueries(["requests"]);
        }, [incrementRequestNotifications, refetchRequests, queryClient]);

        const requestAcceptedHandler = useCallback(() => {
            // Decrement the request notification count when a request is accepted
            decrementRequestNotifications();
            // Actively refetch the requests data
            refetchRequests();
            // Also invalidate other related queries
            queryClient.invalidateQueries(["requests", "friends"]);
        }, [decrementRequestNotifications, refetchRequests, queryClient]);

        const requestRejectedHandler = useCallback(() => {
            // Decrement the request notification count when a request is rejected
            decrementRequestNotifications();
            // Actively refetch the requests data
            refetchRequests();
            // Also invalidate the requests query to ensure data is fresh
            queryClient.invalidateQueries(["requests"]);
        }, [decrementRequestNotifications, refetchRequests, queryClient]);

        // Handle new message alerts - simplified
        const newMessageAlertHandler = useCallback((data) => {
            if (data && data.chatId) {
                // Increment the count by 1 for each new message
                const currentCount = messageCounts[data.chatId] || 0;
                updateMessageCount(data.chatId, currentCount + 1);
            }
        }, [updateMessageCount, messageCounts]);
        
        // Set up message alert event listener
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
            if (!socket) return;
            
            const typingHandler = (data) => {
                if (data.chatId && data.user) {
                    setUserTyping(data.chatId, data.user._id, data.user.name);
                }
            };
            
            const stopTypingHandler = (data) => {
                if (data.chatId && data.user) {
                    removeUserTyping(data.chatId, data.user._id);
                }
            };
            
            const friendRequestHandler = (data) => {
                // Only increment notification count if the current user is the recipient
                if (data && data.recipient && data.recipient._id === localStorage.getItem('userId')) {
                    console.log("Received friend request:", data);
                    newRequestHandler();
                }
            };
                
            socket.on(TYPING, typingHandler);
            socket.on(STOP_TYPING, stopTypingHandler);
            socket.on(NEW_FRIEND_REQUEST, friendRequestHandler);
            socket.on(NEW_FRIEND_REQUEST_ACCEPTED, requestAcceptedHandler);
            socket.on(NEW_FRIEND_REQUEST_REJECTED, requestRejectedHandler);
            
            return () => {
                socket.off(TYPING, typingHandler);
                socket.off(STOP_TYPING, stopTypingHandler);
                socket.off(NEW_FRIEND_REQUEST, friendRequestHandler);
                socket.off(NEW_FRIEND_REQUEST_ACCEPTED, requestAcceptedHandler);
                socket.off(NEW_FRIEND_REQUEST_REJECTED, requestRejectedHandler);
            };
        }, [
            socket, 
            setUserTyping, 
            removeUserTyping, 
            newRequestHandler, 
            requestAcceptedHandler, 
            requestRejectedHandler
        ]);

        // Handle user status changes - only update for friends
        useEffect(() => {
            if (!socket) return;
            
            const friendIds = new Set(friends.map(friend => friend._id));
            
            const statusChangeHandler = ({ userId, isOnline, lastActive }) => {
                // Only update status for friends
                if (friendIds.has(userId)) {
                    setUserOnlineStatus(userId, isOnline, lastActive);
                }
            };
            
            // Listen for user status changes
            socket.on(USER_STATUS_CHANGE, statusChangeHandler);
            
            return () => {
                socket.off(USER_STATUS_CHANGE, statusChangeHandler);
            };
        }, [socket, setUserOnlineStatus, friends]);

        return (
            <>
                <Title />
                <div className="flex flex-col md:grid md:grid-cols-5 lg:grid-cols-4 max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-4rem)] mt-2 sm:mt-4 h-full px-2 sm:px-4">
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