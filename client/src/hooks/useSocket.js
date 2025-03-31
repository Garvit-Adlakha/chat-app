import { useEffect } from 'react';
import useSocketStore from '../socket/Socket';

const useSocketEvents = (socket, handlers) => {
    const { connect, disconnect } = useSocketStore();
    useEffect(() => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.on(event, handler);
      });
  
      return () => {
        Object.entries(handlers).forEach(([event, handler]) => {
          socket.off(event, handler);
        });
      };
    }, [socket, handlers]);
  };

export default useSocketEvents;