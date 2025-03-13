import { useState, useEffect } from "react";
import { IconX, IconSearch, IconUserPlus } from "@tabler/icons-react";

const FriendSearch = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState("");

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

    // Dummy user data (Replace with API data)
    const users = [
        { id: 1, name: "John Doe", email: "john@example.com", avatar: "https://i.pravatar.cc/50?img=1" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", avatar: "https://i.pravatar.cc/50?img=2" },
    ];

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
                                key={user.id} 
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
                                <button className="btn btn-sm btn-primary">
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
