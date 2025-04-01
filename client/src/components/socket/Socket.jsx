import io from 'socket.io-client';
import { create } from 'zustand';

// Dynamically fetch token before each connection attempt
const getAuthToken = () => {
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(c => c.startsWith('token='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
};

const useSocketStore = create((set, get) => {
  let socket = null;

  return {
    socket: null,
    isConnected: false,
    lastMessage: null,

    connect: () => {
      if (get().isConnected) return; // Prevent duplicate connections

      // Create socket dynamically with fresh token
      socket = io(import.meta.env.VITE_API_URL, {
        autoConnect: false,
        transports: ['websocket', 'polling'],
        withCredentials: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: {
          token: getAuthToken()
        },
        extraHeaders: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });

      set({ socket });

      socket.connect();

      socket.on('connect', () => {
        console.log('✅ Socket connected!', socket.id);
        set({ isConnected: true });
      });

      socket.on('disconnect', () => {
        console.warn('⚠ Socket disconnected');
        set({ isConnected: false });
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
        set({ isConnected: false });
      });
    },

    disconnect: () => {
      if (!socket) return;

      // Remove all event listeners
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');

      socket.disconnect();
      set({ isConnected: false, socket: null });
      console.log('🔌 Socket disconnected');
    },

    sendMessage: (message) => {
      if (!get().isConnected || !socket) {
        console.warn('⚠ Cannot send message: Socket is disconnected');
        return;
      }

      try {
        socket.emit('message', message);
        set({ lastMessage: message });
      } catch (error) {
        console.error('❌ Message send error:', error.message);
      }
    }
  };
});

export default useSocketStore;
