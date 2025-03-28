import axiosInstance from "../axios/axiosInstance";
import toast from 'react-hot-toast';

const chatService = {
  UserChats:async()=>{
    try {
      const response=await axiosInstance.get('/chat/getChat')
      toast.success(response.data.message,)
      return response.data.chats

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch chats", { ...toastOptions, icon: '😞' });
      throw error;
    }
  },
  UserGroupChats:async()=>{
    try {
      const response=await axiosInstance.get('/chat/getGroup')
      console.log(response.data)
      toast.success(response.data.message,)
      return response.data.groups
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch chats", { ...toastOptions, icon: '😞' });
      throw error;
    }
  },
  createGroup:async({name,members})=>{
    try {
      const response=await axiosInstance.post('/chat/new',{name,members})
      console.log("response from create group'",response.data)
      toast.success(response.data.message,)
      return response.data.group
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
      throw error;
    }
  },
  getMessage:async({chatId,page})=>{
    try {
      const response=await axiosInstance.get(`/chat/message/${chatId}`,{
        params:{
          page
        }
    })
      console.log("response from get message'",response.data)
      toast.success(response.data.message,)
      return{
        messages:response.data.messages,
        total:response.data.totalPages,
        totalMessages:response.data.totalMessagesCount,
        currentPage:response.data.currentPage
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
      throw error;
    }
  },
  getChatDetails:async(chatId)=>{
    try {
      //http://localhost:5001/api/v1/chat/67e1995428dd55c93e01ff12?populate=true
      const response=await axiosInstance.get(`/chat/${chatId}?populate=true`)
      console.log("response from get chat details'",response.data)
      toast.success(response.data.message,)
      return response.data.chat
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch chat details");
      throw error;
    }
  },
}

export default chatService;