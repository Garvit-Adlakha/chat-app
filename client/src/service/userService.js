import axiosInstance from "../axios/axiosInstance";

const userService = {
  //todo add signup
  login: async (data) => {
    try {
      console.log("data in login", data);
      const response = await axiosInstance.post('/user/signin', data);
      console.log("response in login", response.data.message);
      return response.data;
    } catch (error) {
      // Throw the error so React Query can catch it
      throw new Error(error.response?.data?.message || error.message || "Login failed");
    }
  },
  currentUser: async () => {
    try {
      const response = await axiosInstance.get('/user/profile');
      return response.data.data.user;
    } catch (error) {
      // Throw the error so React Query can catch it
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch user");
    }
  },
  userProfile: async (userId) => {
    try {
      const response = await axiosInstance.get(`/user/profile/${userId}`);
      return response.data.data.user;
    }
    catch (error) {
      // Throw the error so React Query can catch it
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch user");
    }
  },
  logout: async () => {
    try {
      const response = await axiosInstance.post('/user/signout');
      return response.data;
    } catch (error) {
      // Throw the error so React Query can catch it
      throw new Error(error.response?.data?.message || error.message || "Logout failed");
    }
  },
  UserFriends: async (query = "") => {
    try {
      const response = await axiosInstance.get('/user/getfriends');
      console.log("response in friends", response.data.friends);
      return response.data.friends;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch friends");
    }
  },
  UserSearch: async (query) => {
    try {
      const response = await axiosInstance.get(`/user/search?name=${query}`)
      console.log("response from userSearch", response.data)
      return response.data.users
    } catch (error) {
      throw error;
    }
  },
  SendFriendRequest: async (receiverId) => {
    try {
      const response = await axiosInstance.put('/user/sendrequest', { receiverId })
      return response.data.data.request
    } catch (error) {
      throw error;  
    }
  },  
  AcceptFriendRequest: async ({ requestId, accept }) => {
    try {
      const response = await axiosInstance.put('/user/acceptrequest', { requestId, accept })
      return response.data
    } catch (error) {
      throw error;
    }
  },
  getAllNotifications: async () => {
    try {
      const response = await axiosInstance.get('/user/notifications')
      return response.data.data.requests
    } catch (error) {
      throw error;
    }
  },
}

export default userService;
