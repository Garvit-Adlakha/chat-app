import { Search } from "../shared/Search";
import { IconUsersPlus } from "@tabler/icons-react";
import { useState } from "react";
import Modal from "./NewGroup";
import { useQuery } from "@tanstack/react-query";
import chatService from "../../service/chatService";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../ui/sidebar";
import GroupAvatar from "../shared/GroupAvatar"; // Add this import

const GroupsSection = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: groups = [], isLoading } = useQuery({
        queryKey: ["groups"],
        queryFn: chatService.UserGroupChats,
    });
    const {open,setOpen}=useSidebar()

    const navigate=useNavigate()

    const handleCreateGroup = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };
    const groupClickHandler = (groupId) => {
        if(open){
            setOpen(false)
        }
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
        <div className="overflow-y-auto flex-1 h-full">
            <div className="border-b border-neutral-200 dark:border-neutral-700">
                <div className="pb-2 border-neutral-200 dark:border-neutral-700 px-2 sm:px-4">
                    <Search
                        placeholder="Search groups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="p-2 sm:p-4">
                    <button 
                        className="w-full  h-full btn bg-black/50 hover:bg-black/60 text-white rounded-lg cursor-pointer px-3 py-1.5 sm:px-4 sm:py-2.5 flex items-center justify-center gap-1.5 sm:gap-2" 
                        onClick={handleCreateGroup}
                    >
                        <IconUsersPlus className="w-fit h-fit" />
                        <span className="inline text-sm font-medium">Create new Group</span>
                    </button>
                </div>
            </div>

            <div className="p-2 sm:p-4">
                <h3 className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2 sm:mb-3">
                    Groups
                </h3>
                <div className="space-y-1 sm:space-y-2">
                    {filteredGroups.length > 0 ? (
                        filteredGroups.map(group => (
                            <div 
                                onClick={() => groupClickHandler(group._id)}
                                key={group._id} 
                                className="flex items-center p-1.5 sm:p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
                            >
                                <div className="avatar mr-1.5 sm:mr-2">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden">
                                        <GroupAvatar 
                                            groupIcon={group.groupIcon}
                                            name={group.name} 
                                            size="md"
                                            className="w-full h-full"
                                        />
                                    </div>
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                                    {group.name}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-neutral-500 text-xs sm:text-sm">
                            No groups found
                        </div>
                    )}
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
