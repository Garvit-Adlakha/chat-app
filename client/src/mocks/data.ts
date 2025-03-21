export const mockGroups = [
    { id: "group1", name: "Team Alpha", icon: "🚀" },
    { id: "group2", name: "Project Beta", icon: "🔬" },
    { id: "group3", name: "Gaming Squad", icon: "🎮" }
];

export const mockCurrentUser: User = {
    _id: "user1",
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: {
        url: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
    },
    isOnline: true
};

export const mockFriends = [
    { id: "friend1", name: "Alice Smith", avatar: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp", online: true },
    { id: "friend2", name: "Bob Johnson", avatar: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp", online: false },
    { id: "friend3", name: "Carol Williams", avatar: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp", online: true }
];