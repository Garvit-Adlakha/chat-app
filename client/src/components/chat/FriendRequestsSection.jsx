import { useEffect, useState } from "react";
import {IconUsersPlus, IconHandLoveYou} from '@tabler/icons-react';
import FriendSearch from "./FriendSearch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import userService from "../../service/userService";
import toast from "react-hot-toast";
import useChatStore from "../../store/chatStore";

const FriendRequestsSection = () => {
    const [isOpen,setIsOpen] = useState(false);
    const [requestToReject, setRequestToReject] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const {setRequestNotifications} = useChatStore();
    
    const {data:requests = [], isLoading, isError, error} = useQuery({
        queryKey:["requests"],
        queryFn: userService.getAllNotifications,
        onSuccess: (data) => {
            // Update notification count whenever request data changes
            setRequestNotifications(data.length);
        },
        onError: (error) => {
            toast.error(`Failed to load requests: ${error.message}`);
        }
    });

    const queryClient = useQueryClient();
    const acceptMutation=useMutation({
        mutationFn: userService.AcceptFriendRequest,
        // Enable optimistic updates
        onMutate: async (variables) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries(["requests"]);
            
            // Snapshot the previous value
            const previousRequests = queryClient.getQueryData(["requests"]);
            
            // Optimistically update to the new value
            queryClient.setQueryData(["requests"], old => {
                return old.filter(request => request._id !== variables.requestId);
            });
            
            // Return a context object with the snapshot value
            return { previousRequests };
        },
        onSuccess:(_, variables)=>{
            if(variables.accept === true) {
                toast.success("Friend request accepted");
                // Also invalidate friends list
                queryClient.invalidateQueries(["friends"]);
            } else {
                toast.success("Friend request rejected");
            }
            queryClient.invalidateQueries(["requests"]);
        },
        onError:(error, variables, context)=>{
            // Rollback to the previous value if mutation fails
            queryClient.setQueryData(["requests"], context.previousRequests);
            
            // Show more specific error message
            const errorMessage = error.message || "Failed to process friend request";
            toast.error(`Error: ${errorMessage}`);
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries(["requests"]);
        }
    });
    
    const handleAccept = (id) => {
        acceptMutation.mutate({requestId: id, accept: true});
    };

    const handleReject = (id) => {
        // Direct reject without confirmation
        acceptMutation.mutate({requestId: id, accept: false});
    };
    
    const openRejectConfirmation = (id) => {
        setRequestToReject(id);
        setShowConfirmDialog(true);
    };
    
    const confirmReject = () => {
        if (requestToReject) {
            acceptMutation.mutate({requestId: requestToReject, accept: false});
            setShowConfirmDialog(false);
            setRequestToReject(null);
        }
    };
    
    const cancelReject = () => {
        setShowConfirmDialog(false);
        setRequestToReject(null);
    };

    if(isLoading){
        return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        )
    }
    
    if(isError){
        return (
        <div className="flex flex-col items-center justify-center h-full text-red-500">
            <p className="text-sm font-medium">Error loading friend requests</p>
            <p className="text-xs">{error.message}</p>
            <button 
                onClick={() => queryClient.invalidateQueries(["requests"])} 
                className="mt-2 px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
                Retry
            </button>
        </div>
        )
    }
    
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                <button className="w-full btn bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 flex items-center justify-center gap-2"
                onClick={() => setIsOpen(!isOpen)}
                >
                    <IconUsersPlus className="w-5 h-5" />
                    <span className="font-medium">Send Friend Request</span>
                </button>
            </div>
            <FriendSearch 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)}
            />

            <div className="flex-1 overflow-y-auto p-4">
                {requests && requests.length > 0 ? (
                    <div className="space-y-3">
                        {requests.map(request => (
                            <div key={request._id} 
                                className="flex items-center p-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                            >
                                <div className="relative">
                                    <img 
                                        src={request.sender.avatar} 
                                        alt={request.sender.name} 
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                    <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                                        {request.sender.name}
                                    </h3>
                                </div>
                                <div className="flex gap-2 ml-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleAccept(request._id)}
                                        disabled={acceptMutation.isLoading}
                                        className={`px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded-md transition-colors ${
                                            acceptMutation.isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'
                                        }`}
                                    >
                                        {acceptMutation.isLoading && acceptMutation.variables?.requestId === request._id && acceptMutation.variables?.accept === true ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Accepting...
                                            </span>
                                        ) : 'Accept'}
                                    </button>
                                    <button
                                        onClick={() => openRejectConfirmation(request._id)}
                                        disabled={acceptMutation.isLoading}
                                        className={`px-2 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-600 rounded-md transition-colors ${
                                            acceptMutation.isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-neutral-300 dark:hover:bg-neutral-500'
                                        }`}
                                    >
                                        {acceptMutation.isLoading && acceptMutation.variables?.requestId === request._id && acceptMutation.variables?.accept === false ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-neutral-600 dark:text-neutral-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Rejecting...
                                            </span>
                                        ) : 'Reject'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-500 dark:text-neutral-400">
                        <IconHandLoveYou className="w-12 h-12 mb-2" />
                        <p className="text-sm font-medium">No friend requests</p>
                    </div>
                )}
            </div>
            
            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-4">Reject Friend Request</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">Are you sure you want to reject this friend request?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelReject}
                                className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-600 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReject}
                                className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FriendRequestsSection;
