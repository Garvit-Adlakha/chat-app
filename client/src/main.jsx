import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import validateClientEnv from './utils/validateEnv';
import './index.css';

// Check environment variables
validateClientEnv();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
