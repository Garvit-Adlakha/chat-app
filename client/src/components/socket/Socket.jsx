import io from 'socket.io-client';
import { create } from 'zustand';

// Enhanced function to get auth token from multiple sources
const getAuthToken = () => {
  // Try cookie first
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(c => c.startsWith('token='));
  const cookieToken = tokenCookie ? tokenCookie.split('=')[1] : null;
  
  // Fall back to localStorage if cookie is not available
  const localStorageToken = localStorage.getItem('authToken');
  
  // Return the first available token
  return cookieToken || localStorageToken || null;
};

// Create socket instance with better reconnection and authentication settings
const createSocket = () => io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  auth: (cb) => {
    const token = getAuthToken();
    cb({ token });
  }
});

const useSocketStore = create((set, get) => {
  const socket = createSocket();
  
  return {
    socket,
    isConnected: false,
    lastMessage: null,
    connectionError: null,
    reconnectAttempts: 0,

    connect: () => {
      if (!get().isConnected) {
        // Clear previous listeners
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('reconnect_attempt');
        socket.off('reconnect');
        socket.off('reconnect_error');
        
        socket.on('connect', () => {
          console.log('Socket connected!', socket.id);
          set({ 
            isConnected: true,
            connectionError: null,
            reconnectAttempts: 0
          });
        });
        
        socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          set({ isConnected: false });
          
          // If the server closed the connection, attempt to reconnect automatically
          if (reason === 'io server disconnect') {
            socket.connect();
          }
        });
        
        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error.message);
          set({ 
            isConnected: false,
            connectionError: error.message
          });
        });
        
        socket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`Socket reconnection attempt #${attemptNumber}`);
          set({ reconnectAttempts: attemptNumber });
        });
        
        socket.on('reconnect', (attemptNumber) => {
          console.log(`Socket reconnected after ${attemptNumber} attempts`);
          set({ 
            isConnected: true,
            connectionError: null,
            reconnectAttempts: 0
          });
        });
        
        socket.on('reconnect_error', (error) => {
          console.error('Socket reconnection error:', error.message);
        });
        
        // Attempt to connect
        socket.connect();
      }
    },
    
    disconnect: () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('reconnect_attempt');
      socket.off('reconnect');
      socket.off('reconnect_error');
      socket.disconnect();
      set({ 
        isConnected: false,
        connectionError: null,
        reconnectAttempts: 0
      });
    },
    
    sendMessage: (message) => {
      if (get().isConnected) {
        socket.emit('message', message);
        set({ lastMessage: message });
      }
    },
    
    // Add method to check connection status
    checkConnection: () => {
      return {
        isConnected: get().isConnected,
        error: get().connectionError
      };
    }
  };
});

export default useSocketStore;