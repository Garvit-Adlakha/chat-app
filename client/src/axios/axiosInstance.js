import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;
const axiosInstance = axios.create({
  baseURL,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure cookies are sent with cross-origin requests
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// // Add an interceptor to handle 401 unauthorized errors
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Clear any local storage data
//       localStorage.clear();
//       // Handle session timeout - redirect to login
//       if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
//         window.location.href = '/login?session=expired';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
