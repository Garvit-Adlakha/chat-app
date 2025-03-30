import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import userService from '../../service/userService';
import { Search } from '../shared/Search';
import Avatar from '../shared/Avatar';
import ProfileSection from '../profile/ProfileSection';
import {IconX} from '@tabler/icons-react';

const FriendsSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const { data: friends = [], isLoading, error } = useQuery({
    queryKey: ['friends'],
    queryFn: userService.UserFriends
  });

  const filteredFriends = friends?.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clickHandler = (id) => {
    setSelectedFriendId(id);
  };

  useEffect(() => {
    if (selectedFriendId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedFriendId]);
  

  return (
    <div className="flex flex-col max-h-[90vh]">
      {/* Dialog */}
      {selectedFriendId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur shadow-xl">
          <div className="bg-white dark:bg-neutral-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => setSelectedFriendId(null)}
              className="absolute top-4 right-4 z-60 text-neutral-500 cursor-pointer hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              <IconX size={24} />
            </button>
            <ProfileSection userId={selectedFriendId} />
          </div>
        </div>
      )}
      
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
                onClick={()=>clickHandler(friend._id)}
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