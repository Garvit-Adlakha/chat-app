import { useState, useEffect } from "react";
import { IconX, IconSearch, IconUserPlus } from "@tabler/icons-react";
import { useQuery,useMutation, useQueryClient } from "@tanstack/react-query";
import userService from "../../service/userService";
import toast from "react-hot-toast";
const FriendSearch = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState("");

    const {data: users = [], isLoading} = useQuery({
        queryKey: ["users", searchQuery],
        queryFn: () => userService.UserSearch(searchQuery),
        enabled: !!searchQuery,
    });
    const queryClient = useQueryClient();
    const mutation=useMutation({
        mutationFn: userService.SendFriendRequest,
        onSuccess:()=>{
            toast.success("Friend request sent successfully")
            queryClient.invalidateQueries({ queryKey: ["users", searchQuery] })
        },
        onError:(error)=>{
            toast.error(error?.response?.data?.message || "Failed to send friend request")
        }
    })
    const handleAddFriend = (id) => {
        
        mutation.mutate(id)
    }

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    // Loading state inside the modal to maintain consistent UI
    if (isLoading) {
        return (
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <div className="bg-white dark:bg-neutral-800 w-full max-w-md rounded-xl shadow-xl p-6 flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-neutral-600 dark:text-neutral-300">Searching...</p>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white dark:bg-neutral-800 w-full max-w-md rounded-xl shadow-xl transform transition-all">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                            Add New Friend
                        </h3>
                        <button
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                            onClick={onClose}
                        >
                            <IconX className="w-5 h-5 text-neutral-500" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <input
                            type="text"
                            placeholder="Search by username or email..."
                            className="w-full px-4 py-2 pl-10 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-800 dark:text-neutral-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <IconSearch className="absolute left-3 top-2.5 w-5 h-5 text-neutral-400" />
                    </div>

                    {/* Results */}
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {users.map((user) => (
                            <div 
                                key={user._id} 
                                className="flex items-center justify-between p-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="avatar">
                                        <div className="w-10 h-10 rounded-full overflow-hidden">
                                            <img 
                                                src={user.avatar} 
                                                alt={user.name} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-neutral-800 dark:text-neutral-200">
                                            {user.name}
                                        </h4>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                                <button className="btn btn-sm btn-primary"
                                onClick={() => handleAddFriend(user._id)}
                                >
                                    <IconUserPlus className="w-4 h-4 mr-1" />
                                    Add
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FriendSearch;
