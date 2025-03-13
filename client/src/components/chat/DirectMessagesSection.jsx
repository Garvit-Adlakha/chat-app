import { useState } from 'react';
import { Search } from '../shared/Search';
import Avatar from '../shared/Avatar';

const DirectMessagesSection = ({ friends, showOnlineOnly, setShowOnlineOnly }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFriends = friends.filter(friend =>
        (!showOnlineOnly || friend.online) &&
        friend.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className=" border-neutral-200 dark:border-neutral-700">
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
                        className="toggle "
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
                            <div key={friend.id} className="flex items-center p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer">
                                <Avatar src={friend.avatar} alt={friend.name} className="w-10 h-10 mr-3" />
                                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {friend.name}
                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">No friends found.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default DirectMessagesSection;