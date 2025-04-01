import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

export const fileUploadInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 300000, // 5 minutes
  // DO NOT set Content-Type header for FormData uploads
  // Let the browser handle it automatically with multipart/form-data
  maxContentLength: 50 * 1024 * 1024,
  maxBodyLength: 50 * 1024 * 1024
});

export default axiosInstance;
