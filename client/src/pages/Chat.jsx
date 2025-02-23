import AppLayout  from "@/components/layout/AppLayout"

const Chat = () => {
  return (
    <div>Chat</div>
  )
}

const wrappedChat=AppLayout()(Chat)
export default wrappedChat