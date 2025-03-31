import axiosInstance from "../axios/axiosInstance";

const chatService = {
  UserChats: async () => {
    try {
      const response = await axiosInstance.get('/chat/getChat')
      return response.data.chats
    } catch (error) {
      throw error;
    }
  },
  
  UserGroupChats: async () => {
    try {
      const response = await axiosInstance.get('/chat/getGroup')
      return response.data.groups
    } catch (error) {
      throw error;
    }
  },
 
  createGroup: async ({name, members, icon}) => {
    try {
      // Create a FormData object for handling both text data and files
      const formData = new FormData();
      formData.append('name', name);
      
      // Add members as array items
      if (Array.isArray(members)) {
        members.forEach(memberId => {
          formData.append('members', memberId);
        });
      }
      
      // Handle icon based on its type - only process image files
      if (typeof icon === 'string' && icon.startsWith('data:image')) {
        try {
          // Convert base64 to a file object
          const response = await fetch(icon);
          const blob = await response.blob();
          const file = new File([blob], 'groupIcon.png', { type: 'image/png' });
          // Use 'groupIcon' as the field name to match the server's expectation
          formData.append('groupIcon', file);
        } catch (error) {
          console.error("Error converting image:", error);
          // If conversion fails, don't include the icon
        }
      }
      
      // DEBUG: Log the form data entries
      for (let [key, value] of formData.entries()) {
      }
      
      const response = await axiosInstance.post('/chat/new', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.chat;
    } catch (error) {
      console.error("Group creation error details:", error);
      if (error.response?.data) {
        console.error("Server response:", error.response.data);
        // Extract error message for toast notification
        const errorMessage = error.response.data.message || 
                            (error.response.data.error && error.response.data.error.message) || 
                            "Failed to create group";
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  getMessage: async ({chatId, page}) => {
    try {
      const response = await axiosInstance.get(`/chat/message/${chatId}`, {
        params: {
          page
        }
      })
      // Messages come from server newest first (descending order by createdAt)
      // We're not reversing them here, will handle display order in the component
      return {
        messages: response.data.messages,
        total: response.data.totalPages,
        totalMessages: response.data.totalMessageCount,
        currentPage: response.data.currentPage
      }
    } catch (error) {
      throw error;
    }
  },

  getChatDetails: async (chatId) => {
    try {
      const response = await axiosInstance.get(`/chat/${chatId}?populate=true`)
      return response.data.chat
    } catch (error) {
      throw error;
    }
  },
  sendAttachments: async ({chatId, files}) => {
    try {
      // Make sure we're appending chatId to the FormData
      if (files instanceof FormData) {
        // Check if chatId is already in FormData, if not add it
        if (!files.has('chatId')) {
          files.append('chatId', chatId);
        }
        
        // Log the content type of files for debugging
   
        
        const response = await axiosInstance.post(`/chat/message`, files, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        // If files is not FormData, create a new FormData
        const formData = new FormData();
        formData.append('chatId', chatId);
        
        if (Array.isArray(files)) {
          files.forEach(file => {
            formData.append('files', file);
          });
        } else {
          formData.append('files', files);
        }
        
        const response = await axiosInstance.post(`/chat/message`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      // Provide more detailed error information
      if (error.response) {
        console.error('Server responded with:', error.response.status, error.response.data);
      }
      throw error;
    }
  },
  addMembersToGroup: async ({chatId, members}) => {
    try {
      const response = await axiosInstance.put('/chat/addMembers', {
        chatId, 
        members
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  deleteGroup: async (chatId) => {
    try {
        if (!chatId) {
            throw new Error('Chat ID is required for deletion');
        }
        
        const response = await axiosInstance.delete(`/chat/${chatId}`);
        return response.data;
    } catch (error) {
        console.error("Error in deleteGroup service:", error);
        console.error("Error response:", error.response?.data);
        throw error;
    }
  },
  removeMemebrsFromGroup: async ({chatId, members}) => {
    try {
      const response = await axiosInstance.put('/chat/removeMembers', {
        chatId, 
        members
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  renameGroup: async ({chatId, name}) => {
    try {
      const response = await axiosInstance.put(`/chat/${chatId}`, {
        name
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  leaveGroup:async({chatId}) => {
      try {
          const response= await axiosInstance.delete(`/chat/leave/${chatId}`);
          return response.data;
      } catch (error) {
          console.error("Error in leaveGroup service:", error);
          console.error("Error response:", error.response?.data);
          throw error;
      }
  }
}

export default chatService;
