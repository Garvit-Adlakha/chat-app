import io from 'socket.io-client';
import { create } from 'zustand';

// Get token from cookies, localStorage or both
// Dynamically fetch token before each connection attempt
const getAuthToken = () => {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
};

// Make sure we're using the correct server URL and port
const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const createSocket = () => io(serverUrl, {
  autoConnect: false, 
  transports: ['websocket', 'polling'],
  withCredentials: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000, // Increase timeout for slower connections
  auth: (cb) => {
    cb({ token: getAuthToken() }); // Get token dynamically at connection time
  }
});

const useSocketStore = create((set, get) => {
  const socket = createSocket();
  
  return {
    socket,
    isConnected: false,
    lastMessage: null,
    connectionError: null,

    connect: () => {
      if (!get().isConnected) {
        // Clear previous listeners to avoid duplicates
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        
        socket.on('connect', () => {
          console.log('Socket connected!');
          set({ 
            isConnected: true,
            connectionError: null
          });
        });
        
        socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          set({ isConnected: false });
        });
        
        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error.message);
          set({ 
            isConnected: false,
            connectionError: error.message
          });
        });
        
        // Now attempt to connect
        socket.connect();
      }
    },
    
    disconnect: () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.disconnect();
      set({ 
        isConnected: false,
        connectionError: null
      });
    },
    
    sendMessage: (message) => {
      if (get().isConnected) {
        socket.emit('message', message);
        set({ lastMessage: message });
        return true; // Indicate success
      }
      return false; // Indicate failure
    },
    
    // Add method to check connection status
    checkConnection: () => {
      return {
        isConnected: get().isConnected,
        error: get().connectionError
      };
    },
    
    // Add method to listen for specific events
    onEvent: (eventName, callback) => {
      if (socket) {
        socket.on(eventName, callback);
        return () => socket.off(eventName, callback); // Return cleanup function
      }
      return () => {}; // Empty cleanup if no socket
    }
  };
});

export default useSocketStore;