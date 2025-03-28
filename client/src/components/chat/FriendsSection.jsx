import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import userService from '../../service/userService';
import { Search } from '../shared/Search';
import Avatar from '../shared/Avatar';

const FriendsSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: friends = [], isLoading, error } = useQuery({
    queryKey: ['friends'],
    queryFn: userService.UserFriends
  });

  const filteredFriends = friends?.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col max-h-[90vh]">
      <div className="border-b border-neutral-200 dark:border-neutral-700 mt-1">
        <Search
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="p-4 overflow-y-auto flex-1">
        {isLoading ? (
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Loading friends...</p>
        ) : error ? (
          <p className="text-red-500 text-sm">Error fetching friends.</p>
        ) : filteredFriends.length > 0 ? (
          <div className="space-y-2">
            {filteredFriends.map(friend => (
              <div
                key={friend._id}
                className="w-full flex items-center p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
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
                  {friend.email && (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {friend.email}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            No friends found.
          </p>
        )}
      </div>
    </div>
  );
};

export default FriendsSection;