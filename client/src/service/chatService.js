import axiosInstance from "../axios/axiosInstance";
import toast from 'react-hot-toast';

const chatService = {
      UserChats:async()=>{
    try {
      const response=await axiosInstance.get('/chat/getChat')
      console.log(response.data.chats)
      toast.success(response.data.message,)
      return response.data.chats

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch chats", { ...toastOptions, icon: '😞' });
      throw error;
    }
  }
}

export default chatService;