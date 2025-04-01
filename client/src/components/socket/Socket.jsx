import io from 'socket.io-client';
import { create } from 'zustand';

// Get token from cookies, localStorage or both
// Dynamically fetch token before each connection attempt
const getAuthToken = () => {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  };

const createSocket = () => io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  withCredentials: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  auth: {
    token: getAuthToken() // Pass token in auth object
  },
  extraHeaders: {
    Authorization: `Bearer ${getAuthToken()}` // Also try headers
  }
});

const useSocketStore = create((set, get) => {
  const socket = createSocket();
  
  return {
    socket,
    isConnected: false,
    lastMessage: null,

    connect: () => {
      if (!get().isConnected) {
        socket.connect();
        
        socket.on('connect', () => {
          console.log('Socket connected!');
          set({ isConnected: true });
        });
        
        socket.on('disconnect', () => {
          set({ isConnected: false });
        });
        
        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error.message);
          set({ isConnected: false });
        });
      }
    },
    
    disconnect: () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.disconnect();
      set({ isConnected: false });
    },
    
    sendMessage: (message) => {
      if (get().isConnected) {
        socket.emit('message', message);
        set({ lastMessage: message });
      }
    }
  };
});

export default useSocketStore;