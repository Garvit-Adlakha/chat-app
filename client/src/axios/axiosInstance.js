import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Critical for sending/receiving cookies
  timeout: 300000, // 5 minutes
  maxContentLength: 50 * 1024 * 1024,
  maxBodyLength: 50 * 1024 * 1024
});

// Updated request interceptor to rely solely on HTTP-only cookies for auth
axiosInstance.interceptors.request.use(
  (config) => {
    // No need to manually add tokens - the withCredentials option will
    // automatically include cookies in requests
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// // Add response interceptor to handle auth errors consistently
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle 401 Unauthorized errors
//     if (error.response && error.response.status === 401) {
//       // Redirect to login page or dispatch authentication error
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
