import { MessageCircle, Users, Settings, LogOut, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useSidebar } from "@/components/ui/sidebar"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

const chatRooms = [
  { id: 1, name: "General", unread: 3 },
  { id: 2, name: "Random", unread: 0 },
  { id: 3, name: "Tech Talk", unread: 1 },
]

const menuItems = [
  { title: "Chats", icon: MessageCircle },
  { title: "Users", icon: Users },
]

const settingsMenuItems = [
  { title: "Account Settings", icon: null },
  { title: "Help & Support", icon: null },
  { title: "Logout", icon: LogOut },
]

export function AppSidebar() {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar()
  const [activeItem, setActiveItem] = useState("Chats")
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)

  return (
    <Sidebar variant="floating" className="min-h-screen border-r border-slate-200/10">
      <SidebarContent className="bg-gradient-to-r from-[#200122] to-[#6f0000] backdrop-blur-lg rounded-xl ">
        {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4  backdrop-blur-lg border-b border-slate-200/10">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#c31432] to-[#240b36] bg-clip-text text-transparent ">
          ChatApp
        </h2>
        <button
          className="text-slate-400 hover:text-slate-100 transition-colors"
          onClick={toggleSidebar}
        >
          {open ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
        <SidebarGroup className="px-2 py-4">
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => setActiveItem(item.title)}
                    isActive={activeItem === item.title}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      activeItem === item.title
                        ? "bg-blue-500/20 text-blue-400"
                        : "hover:bg-slate-800/50 text-slate-300 hover:text-slate-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {activeItem === "Chats" && (
          <SidebarGroup className="px-2">
            <SidebarGroupLabel className="px-3 py-2 text-sm font-semibold text-slate-400">
              Chat Rooms
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {chatRooms.map((room) => (
                  <SidebarMenuItem key={room.id}>
                    <SidebarMenuButton className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-slate-800/50 text-slate-300 hover:text-slate-100 transition-colors">
                      <span className="font-medium">{room.name}</span>
                      {room.unread > 0 && (
                        <span className="ml-auto bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs font-medium">
                          {room.unread}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-colors">
                    <PlusCircle className="w-5 h-5" />
                    <span className="font-medium">New Chat Room</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200/10 p-2 bg-black/94 rounded-xl">
        <SidebarMenuButton
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-colors"
          onClick={() => setShowSettingsMenu(!showSettingsMenu)}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </SidebarMenuButton>

        {showSettingsMenu && (
          <div className="mt-2 bg-black/94 rounded-lg shadow-md">
            <ul className="space-y-1">
              {settingsMenuItems.map((item) => (
                <li key={item.title}>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-colors"
                  >
                    {item.icon && <item.icon className="w-5 h-5" />}
                    <span className="font-medium">{item.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
