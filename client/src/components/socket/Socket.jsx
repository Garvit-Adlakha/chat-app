import io from 'socket.io-client';
import { create } from 'zustand';

const createSocket = () => io(import.meta.env.VITE_API_URL, {
    autoConnect: false,
    transports: ['websocket','polling'],
    withCredentials: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
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
                    set({ isConnected: true });
                });
                
                socket.on('disconnect', () => {
                    set({ isConnected: false });
                });
                
                socket.on('connect_error', (error) => {
                    console.error('Connection error:', error);
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