import { useState, useEffect } from "react";
import { IconX, IconSearch, IconUserPlus } from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userService from "../../service/userService";
import toast from "react-hot-toast";

const FriendSearch = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 600);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    const { data: users = [], isLoading } = useQuery({
        queryKey: ["users", debouncedQuery],
        queryFn: () => userService.UserSearch(debouncedQuery),
    });

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: userService.SendFriendRequest,
        onSuccess: () => {
            toast.success("Friend request sent successfully");
            queryClient.invalidateQueries({ queryKey: ["users", debouncedQuery] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to send friend request");
        },
    });

    const handleAddFriend = (id) => {
        mutation.mutate(id);
    };

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
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]"
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white dark:bg-neutral-800 w-full max-w-md mx-4 rounded-xl shadow-xl transform transition-all">
                <div className="p-4 sm:p-6">
                    <div className="p-2 sm:p-4">
                        <button
                            className="w-full btn bg-black/50 hover:bg-black/60 text-white rounded-lg cursor-pointer px-3 py-1.5 sm:px-4 sm:py-2 flex items-center justify-center gap-1.5 sm:gap-2"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <IconX className="w-5 h-5 text-neutral-500" />
                            <span className="inline text-sm font-medium truncate">Close</span>
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <input
                            type="text"
                            placeholder="Search by username or email..."
                            className="w-full px-4 py-2 pl-10 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-800 dark:text-neutral-200"
                            value={searchQuery}
                            name="search"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <IconSearch className="absolute left-3 top-2.5 w-5 h-5 text-neutral-400" />
                    </div>

                    {/* Results */}
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {users.length === 0 && debouncedQuery && (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <p className="text-neutral-500 dark:text-neutral-400">No users found matching your search.</p>
                            </div>
                        )}
                        {users.length === 0 && !debouncedQuery && (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <p className="text-neutral-500 dark:text-neutral-400">Enter a username or email to search for users.</p>
                            </div>
                        )}
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
                                <button 
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handleAddFriend(user._id)}
                                    disabled={mutation.isPending && mutation.variables === user._id}
                                    aria-label={`Add ${user.name} as friend`}
                                >
                                    {mutation.isPending && mutation.variables === user._id ? (
                                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                                    ) : (
                                        <IconUserPlus className="w-4 h-4 mr-1" />
                                    )}
                                    {mutation.isPending && mutation.variables === user._id ? 'Adding...' : 'Add'}
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
