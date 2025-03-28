import axiosInstance from "../axios/axiosInstance";
import toast from 'react-hot-toast';

const userService = {
  //todo add signup
  login: async (data) => {
    try {
      console.log("data in login", data);
      const response = await axiosInstance.post('/user/signin', data);
      console.log("response in login", response.data.message);
      
      toast(response.data.message, {
        icon: '👏',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Login failed", {
        icon: '😞',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      
      // Throw the error so React Query can catch it
      throw new Error(error.response?.data?.message || error.message || "Login failed");
    }
  },
  currentUser: async () => {
    try {
      const response = await axiosInstance.get('/user/profile');
      toast.success(response.data.message, {
        icon: '👏',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return response.data.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to fetch user", {
        icon: '😞',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      // Throw the error so React Query can catch it
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch user");
    }
  },
  userProfile: async (userId) => {
    try {
      const response = await axiosInstance.get(`/user/profile/${userId}`);
      toast.success(response.data.message, {
        icon: '👏',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return response.data.data.user;
    }
    catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to fetch user", {
        icon: '😞',
      });
      // Throw the error so React Query can catch it
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch user");
    }
  },
  logout: async () => {
    try {
      const response = await axiosInstance.post('/user/signout');
      toast.success(response.data.message, {
        icon: '👏',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Logout failed", {
        icon: '😞',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      // Throw the error so React Query can catch it
      throw new Error(error.response?.data?.message || error.message || "Logout failed");
    }
  },
  UserFriends: async (query = "") => {
    try {
      const response = await axiosInstance.get('/user/getfriends');
      console.log("response in friends", response.data.friends);
      // Only show success toast when explicitly needed, not on regular data fetching
        toast.success("Friends loaded successfully", {
          icon: '👥',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
          // Make toast less intrusive for data fetching operations
          duration: 2000,
        });
      
      return response.data.friends;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to fetch friends", {
        icon: '😞',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch friends");
    }
  },
  UserSearch:async(query)=>{
    try {
    const response=await axiosInstance.get(`/user/search?name=${query}`)
      console.log("response from userSearch",response.data)
      toast.success(response.data.message)
      return response.data.users
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users", { ...toastOptions, icon: '😞' });
      throw error;
    }
  },
  SendFriendRequest:async(receiverId)=>{
    try {
      const response=await axiosInstance.put('/user/sendrequest',{receiverId})
      return response.data.data.request
    } catch (error) {
      throw error;  
    }
  },  
  AcceptFriendRequest:async({requestId,accept})=>{
    try {
      const response=await axiosInstance.put('/user/acceptrequest',{requestId,accept})
      toast.success(response.data.message,)
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept friend request", { ...toastOptions, icon: '😞' });
      throw error;
    }
  },

  getAllNotifications:async()=>{
    try {
      const response=await axiosInstance.get('/user/notifications')
      toast.success(response.data.message,)
      return response.data.data.requests
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch notifications", { ...toastOptions, icon: '😞' });
      throw error;
    }
  }
}

export default userService;