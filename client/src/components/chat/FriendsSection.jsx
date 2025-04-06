import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService from '../../service/userService';
import { Search } from '../shared/Search';
import Avatar from '../shared/Avatar';
import ProfileSection from '../profile/ProfileSection';
import { IconX, IconUserMinus } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const FriendsSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);
  const queryClient = useQueryClient();
  
  const { data: friends, isLoading, error } = useQuery({
    queryKey: ['friends'],
    queryFn: userService.UserFriends,
    onError: (err) => {
      console.error('Error fetching friends:', err);
      toast.error('Failed to load friends');
    }
  });
  const navigate = useNavigate();
  
  const removeFriendMutation = useMutation({
    mutationFn: (friendId) => userService.removeFriends(friendId),
    onSuccess: () => {
      toast.success('Friend removed successfully');
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      navigate('/chat')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove friend');
    }
  });
  
  const filteredFriends = friends?.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const clickHandler = (id) => {
    setSelectedFriendId(id);
  };

  const handleRemoveFriend = (e, friendId) => {
    e.stopPropagation();
    setFriendToRemove(friendId);
    setIsRemoveDialogOpen(true);
  };
  
  const confirmRemoveFriend = () => {
    if (friendToRemove) {
      removeFriendMutation.mutate(friendToRemove);
      setIsRemoveDialogOpen(false);
      setFriendToRemove(null);
    }
  };

  const cancelRemoveFriend = () => {
    setIsRemoveDialogOpen(false);
    setFriendToRemove(null);
  };

  useEffect(() => {
    if (selectedFriendId || isRemoveDialogOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedFriendId, isRemoveDialogOpen]);

  useEffect(() => {
    if (error) {
      console.error('Friends fetch error details:', error);
    }
    if (friends && friends.length > 0) {
      console.log('Friends loaded successfully:', friends.length);
    }
  }, [friends, error]);

  return (
    <div className="flex flex-col max-h-[90vh]">
      {/* Profile Dialog */}
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
      
      {/* Remove Friend Confirmation Dialog */}
      {isRemoveDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-xl w-full max-w-sm mx-4 p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-3">
              Remove Friend
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300 mb-5">
              Are you sure you want to remove this friend? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelRemoveFriend}
                className="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveFriend}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
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
                className="w-full flex items-center justify-between p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <div className="flex items-center">
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
                <button
                  onClick={(e) => handleRemoveFriend(e, friend._id)}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Remove friend"
                >
                  <IconUserMinus size={18} />
                </button>
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