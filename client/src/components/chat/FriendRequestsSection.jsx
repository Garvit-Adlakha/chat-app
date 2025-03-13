import { useState } from "react";
import {IconUsersPlus, IconHandLoveYou} from '@tabler/icons-react';
import FriendSearch from "./FriendSearch";

const FriendRequestsSection = () => {
    const [isOpen,setIsOpen] = useState(false);
    const [requests] = useState([
        {
            id: '1',
            name: 'Sarah Wilson',
            avatar: 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp',
            mutualFriends: 3
        },
        {
            id: '2',
            name: 'Mike Chen',
            avatar: 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp',
            mutualFriends: 5
        }
    ]);

    const handleAccept = (id) => {
        // TODO: Implement accept logic
        console.log('Accepted request:', id);
    };

    const handleReject = (id) => {
        // TODO: Implement reject logic
        console.log('Rejected request:', id);
    };
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
                {requests.length > 0 ? (
                    <div className="space-y-3">
                        {requests.map(request => (
                            <div key={request.id} 
                                className="flex items-center p-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                            >
                                <div className="relative">
                                    <img 
                                        src={request.avatar} 
                                        alt={request.name} 
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                    <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                                        {request.name}
                                    </h3>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {request.mutualFriends} mutual friends
                                    </p>
                                </div>
                                <div className="flex gap-2 ml-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleAccept(request.id)}
                                        className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleReject(request.id)}
                                        className="px-2 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-600 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-500 transition-colors"
                                    >
                                        Reject
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
        </div>
    );
};

export default  FriendRequestsSection;
