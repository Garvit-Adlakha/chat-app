import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL
const axiosInstance = axios.create({
  baseURL,
  timeout: 20000,
  withCredentials: true, // This is critical for cookies to be sent/received
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to handle 401 unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error is due to an unauthorized request (401)
    if (error.response && error.response.status === 401) {
      // Handle session timeout - redirect to login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
