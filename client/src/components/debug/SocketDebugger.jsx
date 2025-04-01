import React, { useEffect, useState } from 'react';
import useSocketStore from '../../components/socket/Socket';

const SocketDebugger = () => {
  const { socket, isConnected, connectionError, connect, disconnect } = useSocketStore();
  const [serverUrl, setServerUrl] = useState('');
  const [token, setToken] = useState('');
  
  useEffect(() => {
    setServerUrl(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    setToken(tokenCookie ? tokenCookie.split('=')[1]?.substring(0, 12) + '...' : 'Not found');
  }, []);
  
  const handleReconnect = () => {
    disconnect();
    setTimeout(() => {
      connect();
    }, 500);
  };
  
  return (
    <div className="socket-debugger" style={{ 
      padding: '15px', 
      margin: '10px', 
      border: '1px solid #ccc', 
      borderRadius: '5px',
      backgroundColor: '#f8f9fa'
    }}>
      <h3>Socket Connection Debugger</h3>
      <div>
        <p><strong>Connection Status:</strong> {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
        <p><strong>Server URL:</strong> {serverUrl}</p>
        <p><strong>Auth Token:</strong> {token}</p>
        {connectionError && (
          <p style={{ color: 'red' }}><strong>Error:</strong> {connectionError}</p>
        )}
      </div>
      <div style={{ marginTop: '10px' }}>
        <button 
          onClick={connect}
          disabled={isConnected}
          style={{ 
            marginRight: '10px',
            padding: '5px 10px',
            backgroundColor: isConnected ? '#cccccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: isConnected ? 'default' : 'pointer'
          }}
        >
          Connect
        </button>
        <button 
          onClick={disconnect}
          disabled={!isConnected}
          style={{ 
            marginRight: '10px',
            padding: '5px 10px',
            backgroundColor: !isConnected ? '#cccccc' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: !isConnected ? 'default' : 'pointer'
          }}
        >
          Disconnect
        </button>
        <button 
          onClick={handleReconnect}
          style={{ 
            padding: '5px 10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Reconnect
        </button>
      </div>
    </div>
  );
};

export default SocketDebugger;
