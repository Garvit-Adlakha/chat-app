import ChatWindow from '../components/chat/ChatWindow'
import ChatWindowOnStart from '../components/chat/ChatWindowOnStart'
import AppLayout from '../components/layout/AppLayout'

const MainChat = () => {
  const isChatWindow=true
  return (
    <main>
      {isChatWindow ? <ChatWindow />:<ChatWindowOnStart />}
      
    </main>
  )
}

const MainChatComponent = AppLayout()(MainChat)
export default MainChatComponent 