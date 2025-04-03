import toast from "react-hot-toast";
import axiosInstance from "../axios/axiosInstance";

/**
 * Service for handling user-related API calls
 */
const userService = {
  signUp: async (data) => {
    try {
      let hasAvatar = false;
      for (let [key, value] of data.entries()) {
        if (key === "avatar" && value instanceof File && value.size > 0) {
          hasAvatar = true;
          break;
        }
      }
      
      if (!hasAvatar) {
        throw new Error("Please upload a profile picture");
      }
      
      const response = await axiosInstance.post('/user/signup', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Signup failed");
    }
  },
  login: async (data) => {
    try {
      const response = await axiosInstance.post('/user/signin', data);
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  },
  currentUser: async () => {
    try {
      const response = await axiosInstance.get('/user/profile');
      console.log(response.data);
      return response.data.data.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch user");
    }
  },
  userProfile: async (userId) => {
    try {
      const response = await axiosInstance.get(`/user/profile/${userId}`);
      return response.data.data.user;
    }
    catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch user");
    }
  },
  logout: async () => {
    try {
      const response = await axiosInstance.post('/user/signout');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Logout failed");
    }
  },
  UserFriends: async () => {
    try {
      const response = await axiosInstance.get('/user/getfriends');
      return response.data.friends || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch friends");
    }
  },
  UserSearch: async (query = "") => {
    try {
      const response = await axiosInstance.get(`/user/search?name=${query}`);
      return response.data.users || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || "Search failed");
    }
  },
  SendFriendRequest: async (receiverId) => {
    try {
      const response = await axiosInstance.put('/user/sendrequest', { receiverId });
      return response.data.data.request;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send friend request");
      return response?.data?.message ;
    }
  },  
  AcceptFriendRequest: async ({ requestId, accept }) => {
    try {
      const response = await axiosInstance.put('/user/acceptrequest', { requestId, accept });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to accept friend request");
    }
  },
  getAllNotifications: async () => {
    try {
      const response = await axiosInstance.get('/user/notifications');
      return response.data.data.requests;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch notifications");
    }
  },
  googleAuth: async (idToken) => {
    try {
      const response = await axiosInstance.post('/user/google-auth', { token: idToken });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Google authentication failed");
    }
  },
  updateProfile: async (data) => {
    try {
      const response = await axiosInstance.put('/user/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update profile");
    }
  },
}

export default userService;
