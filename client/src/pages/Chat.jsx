import React from 'react'
import AppLayout from '../components/layout/AppLayout'

const Chat = () => {
  return (
    <div>Chat</div>
  )
}

const ChatComponent = AppLayout()(Chat)
export default ChatComponent