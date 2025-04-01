import { useEffect } from 'react';
import useSocketStore from './Socket';
import { toast } from 'react-hot-toast';

const SocketReconnector = () => {
  const { socket, isConnected, connect, disconnect } = useSocketStore();
  
  // Auto-reconnect when connection is lost
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected) {
        console.log('Document became visible, reconnecting socket...');
        disconnect(); // Clean up first
        setTimeout(() => connect(), 500); // Try to reconnect
      }
    };
    
    const handleOnline = () => {
      if (!isConnected) {
        console.log('Network connection restored, reconnecting socket...');
        toast.success('Network connection restored');
        disconnect();
        setTimeout(() => connect(), 1000);
      }
    };
    
    const handleOffline = () => {
      console.log('Network connection lost');
      toast.error('Network connection lost');
    };
    
    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial connection
    if (!isConnected) {
      connect();
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isConnected, connect, disconnect]);
  
  return null; // This is a utility component, no UI
};

export default SocketReconnector;