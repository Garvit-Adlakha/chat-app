import axios from 'axios';

// Create a custom axios instance with proper configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // Important for sending cookies with requests
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add a request interceptor to include token from localStorage as a fallback
axiosInstance.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage if available
    const token = localStorage.getItem('authToken');
    
    // If token exists, add it to Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token updates and errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Store token in localStorage if present in response
    if (response.data && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response;
  },
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response && error.response.status === 401) {
      // Clear localStorage token
      localStorage.removeItem('authToken');
      
      // If not already on login page, redirect to login
      if (!window.location.pathname.includes('/login')) {
        console.log('Unauthorized access, redirecting to login');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

// Create an instance specifically for file uploads
export const fileUploadInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  timeout: 60000, // 60 seconds for file uploads
  headers: {
    'Accept': 'application/json'
  }
});

// Add same request interceptor for the file upload instance
fileUploadInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
