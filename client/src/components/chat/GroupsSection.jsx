import { Search } from "../shared/Search";
import { IconUsersPlus } from "@tabler/icons-react";
import { useState } from "react";
import Modal from "./NewGroup";
import { useQuery } from "@tanstack/react-query";
import chatService from "../../service/chatService";
import { useNavigate } from "react-router-dom";
const GroupsSection = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: groups = [], isLoading } = useQuery({
        queryKey: ["groups"],
        queryFn: chatService.UserGroupChats,
    });

    const navigate=useNavigate()

    const handleCreateGroup = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };
    const groupClickHandler = (groupId) => {
        navigate(`/chat/${groupId}`);
    }

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if(isLoading){
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="overflow-y-auto flex-1">
            <div className="border-b border-neutral-200 dark:border-neutral-700">
                <div className="pb-2 border-neutral-200 dark:border-neutral-700">
                    <Search
                        placeholder="Search groups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="p-2">
                    <button 
                        className="w-full btn bg-black/50 hover:bg-black/60 text-white rounded-lg cursor-pointer py-2 flex items-center justify-center gap-2" 
                        onClick={handleCreateGroup}
                    >
                        <IconUsersPlus className="w-5 h-5" />
                        <span className="text-sm font-medium">Create new Group</span>
                    </button>
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                    Groups
                </h3>
                <div className="space-y-2">
                    {filteredGroups.map(group => (
                        <div 
                            onClick={() => groupClickHandler(group._id)}
                            key={group._id} 
                            className="flex items-center p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
                        >
                            <div className="avatar mr-2">
                                <div className="w-10 h-10 rounded-full overflow-hidden">

                                    {/* update avatar logic */}
                                    <img 
                                        src={group.avatar[0]} 
                                        alt={group.name} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                {group.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen}
                onClose={handleModalClose}
            />
        </div>
    );
};

export default GroupsSection;
