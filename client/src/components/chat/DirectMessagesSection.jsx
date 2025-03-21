import { lazy, useState } from 'react';
import { Search } from '../shared/Search';
import Avatar from '../shared/Avatar';
import { useNavigate } from 'react-router-dom';

const DirectMessagesSection = ({ friends, showOnlineOnly, setShowOnlineOnly }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const filteredFriends = friends.filter(friend =>
        (!showOnlineOnly || friend.online) &&
        friend.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleFriendClick = (friend) => {
        navigate(`/chat/${friend.id}`);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="border-b border-neutral-200 dark:border-neutral-700 mt-1">
                <Search
                    placeholder="Search friends..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="px-4 py-3 flex items-center border-b border-neutral-200 dark:border-neutral-700">
                <label className="inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showOnlineOnly}
                        onChange={() => setShowOnlineOnly(!showOnlineOnly)}
                        className="toggle"
                    />
                    <span className="ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Online only
                    </span>
                </label>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                    {showOnlineOnly ? "Online Friends" : "All Friends"}
                </h3>
                <div className="space-y-2">
                    {filteredFriends.length > 0 ? (
                        filteredFriends.map(friend => (
                            <button
                                key={friend.id}
                                onClick={() => handleFriendClick(friend)}
                                className="w-full flex items-center p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors text-left"
                            >
                                <Avatar 
                                    src={friend.avatar} 
                                    alt={friend.name} 
                                    className="w-10 h-10 mr-3" 
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                        {friend.name}
                                    </span>
                                    {friend.online && (
                                        <span className="text-xs text-green-500">
                                            Online
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))
                    ) : (
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            No friends found.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DirectMessagesSection;